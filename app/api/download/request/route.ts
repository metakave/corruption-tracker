import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendDownloadLinkEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json()
        const {
            name,
            whatsapp,
            email,
            company,
            designation,
            dataset = 'events',
            format = 'csv',
            downloadQuery = '',
            filters = {},
        } = body

        if (!name?.trim() || !whatsapp?.trim() || !email?.trim() || !company?.trim() || !designation?.trim()) {
            return NextResponse.json(
                { error: 'সকল তথ্য (নাম, হোয়াটসঅ্যাপ, ইমেইল, প্রতিষ্ঠান ও পদবী) পূরণ করা আবশ্যক।' },
                { status: 400 }
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json(
                { error: 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' },
                { status: 400 }
            )
        }

        // Get application base URL from headers or env
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://corruptiontracker.org'
        const fullDownloadUrl = `${origin}/api/download?${downloadQuery || `dataset=${dataset}&format=${format}`}`

        // Extract client IP and User Agent
        const forwardedFor = req.headers.get('x-forwarded-for')
        const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.headers.get('x-real-ip') || null)
        const userAgent = req.headers.get('user-agent') || null

        // Save lead in database
        try {
            await prisma.downloadRequest.create({
                data: {
                    name: name.trim(),
                    whatsapp: whatsapp.trim(),
                    email: email.trim().toLowerCase(),
                    company: company.trim(),
                    designation: designation.trim(),
                    dataset,
                    format,
                    filters: JSON.stringify(filters),
                    downloadUrl: fullDownloadUrl,
                    ipAddress,
                    userAgent,
                },
            })
        } catch (dbErr) {
            console.error('[download/request] Database save error:', dbErr)
        }

        // Build human readable filter summary for email
        const filterEntries = Object.entries(filters)
            .filter(([_, v]) => Boolean(v))
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')

        // Send email via SMTP
        await sendDownloadLinkEmail({
            to: email.trim().toLowerCase(),
            name: name.trim(),
            company: company.trim(),
            designation: designation.trim(),
            whatsapp: whatsapp.trim(),
            dataset,
            format,
            downloadUrl: fullDownloadUrl,
            filtersText: filterEntries || undefined,
        })

        return NextResponse.json({
            success: true,
            message: 'ডাউনলোড লিঙ্কটি সফলভাবে আপনার ইমেইলে পাঠানো হয়েছে।',
            directUrl: fullDownloadUrl,
        })
    } catch (err: any) {
        console.error('[download/request] Error sending download email:', err)
        return NextResponse.json(
            { error: err.message || 'ইমেইল পাঠাতে ত্রুটি হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' },
            { status: 500 }
        )
    }
}
