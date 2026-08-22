import nodemailer from 'nodemailer'

const {
    SMTP_HOST = 'smtp.zoho.com',
    SMTP_PORT = '465',
    SMTP_SECURE = 'true',
    SMTP_USER = 'hello@sadiqalam.com',
    SMTP_PASS = '5aujCz%z',
    SMTP_FROM = 'Bangladesh Corruption Tracker <hello@sadiqalam.com>',
} = process.env

export const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 465,
    secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
})

export interface SendDownloadEmailParams {
    to: string
    name: string
    company: string
    designation: string
    whatsapp: string
    dataset: string
    format: string
    downloadUrl: string
    filtersText?: string
}

export async function sendDownloadLinkEmail(params: SendDownloadEmailParams) {
    const {
        to,
        name,
        company,
        designation,
        dataset,
        format,
        downloadUrl,
        filtersText,
    } = params

    const datasetLabels: Record<string, string> = {
        events: 'Verified Corruption Incidents Dataset (যাচাইকৃত দুর্নীতির ডাটাবেজ)',
        raw: 'Raw Monitored News Articles (সংগৃহীত কাঁচা সংবাদ)',
        stats: 'Aggregated Corruption Statistics (সামষ্টিক পরিসংখ্যান)',
        audit: 'AI Decision Audit Log (এআই অডিট ডাটা)',
    }

    const datasetName = datasetLabels[dataset] || dataset.toUpperCase()
    const formatName = format.toUpperCase()
    const currentYear = new Date().getFullYear()

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background: linear-gradient(135deg, #022c22, #064e3b, #047857); padding: 32px 24px; text-align: center; color: #ffffff; }
            .badge { display: inline-block; padding: 4px 12px; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #a7f3d0; margin-bottom: 8px; }
            .content { padding: 32px 24px; }
            .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; }
            .button { display: inline-block; background: #059669; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: bold; text-decoration: none; text-align: center; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25); margin: 20px 0; }
            .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
            .link-text { word-break: break-all; font-family: monospace; font-size: 11px; color: #059669; background: #f1f5f9; padding: 8px; border-radius: 6px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="badge">Open Data & Intelligence</div>
                <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Bangladesh Corruption Tracker</h1>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #d1fae5;">বাংলাদেশ দুর্নীতি ট্র্যাকার • ওপেন ডাটা পোর্টাল</p>
            </div>
            <div class="content">
                <p style="font-size: 15px; line-height: 1.6;">প্রিয় <strong>${name}</strong>,</p>
                <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                    বাংলাদেশ দুর্নীতি ট্র্যাকার (Bangladesh Corruption Tracker) ওপেন ডাটা প্ল্যাটফর্মে আপনার আগ্রহের জন্য ধন্যবাদ। আপনার অনুরোধকৃত ডাটাবেজের সরাসরি ডাউনলোড লিঙ্ক নিচে প্রদান করা হলো:
                </p>

                <div class="info-box">
                    <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>📊 অনুরোধকৃত ডাটাবেজ:</strong> ${datasetName}</p>
                    <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>📁 ফরম্যাট:</strong> ${formatName}</p>
                    <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>🏢 প্রতিষ্ঠান:</strong> ${company || 'N/A'} (${designation || 'N/A'})</p>
                    ${filtersText ? `<p style="margin: 0; font-size: 12px; color: #64748b;"><strong>🔍 প্রযোজ্য ফিল্টার:</strong> ${filtersText}</p>` : ''}
                </div>

                <div style="text-align: center;">
                    <a href="${downloadUrl}" class="button">📥 ডাউনলোড করুন (${formatName})</a>
                </div>

                <p style="font-size: 12px; color: #64748b; margin-top: 24px;">যদি ওপরের বাটনে ক্লিক করতে সমস্যা হয়, নিচের লিঙ্কটি কপি করে আপনার ব্রাউজারে পেস্ট করুন:</p>
                <div class="link-text">${downloadUrl}</div>
            </div>
            <div class="footer">
                <p style="margin: 0 0 6px 0;">© ${currentYear} Bangladesh Corruption Tracker. সর্বস্বত্ব সংরক্ষিত।</p>
                <p style="margin: 0;">প্রকৌশল পরিচালনায় DeltaFlow Lab ও উন্মুক্ত তথ্য গবেষকবৃন্দ।</p>
            </div>
        </div>
    </body>
    </html>
    `

    // Send to the requester, and BCC admin to track leads
    const mailOptions = {
        from: SMTP_FROM,
        to: to,
        bcc: SMTP_USER, // sends a copy to hello@sadiqalam.com so you get the lead notification
        subject: `[ডাউনলোড লিঙ্ক] ${datasetName} (${formatName}) - Bangladesh Corruption Tracker`,
        html,
        text: `প্রিয় ${name},\n\nবাংলাদেশ দুর্নীতি ট্র্যাকার থেকে আপনার অনুরোধকৃত ${datasetName} (${formatName}) ডাটাবেজ ডাউনলোড করার লিঙ্ক:\n\n${downloadUrl}\n\nধন্যবাদ,\nবাংলাদেশ দুর্নীতি ট্র্যাকার টিম`,
    }

    return await transporter.sendMail(mailOptions)
}
