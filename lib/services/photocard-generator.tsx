import PhotocardTemplate from '@/components/PhotocardTemplate';
import fs from 'fs';
import path from 'path';

interface PoliticalEvent {
    id: string;
    title: string;
    dateOfIncident: Date | null;
    publishedAt: Date;
    district: string | null;
    killed: number | null;
    injured: number | null;
    summary: string | null;
    tags: string | null;
    source: string | null;
    additionalSources: string | null;
}

export async function generatePhotocard(
    event: PoliticalEvent,
    theme: 'classic' | 'dark' | 'crimson' | 'ocean' | 'newspaper' = 'classic'
): Promise<string> {
    let browser = null;

    try {
        const { renderToString } = await import('react-dom/server');
        const puppeteer = (await import('puppeteer')).default;

        // Prepare data for photocard
        const photocardData = {
            title: event.title,
            date: formatBengaliDate(event.dateOfIncident || event.publishedAt),
            location: event.district || 'অজানা',
            killed: String(event.killed || 0),
            injured: String(event.injured || 0),
            tags: event.tags || 'Violence',
            sources: extractSources(event),
            summary: event.summary || event.title
        };

        // Generate HTML with component
        const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@100;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { margin: 0; padding: 0; font-family: 'Noto Serif Bengali', serif; }
            .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
        </style>
    </head>
    <body>
        ${renderToString(
            <PhotocardTemplate data={photocardData} theme={theme as any} />
        )}
    </body>
    </html>
    `;

        // Launch Puppeteer
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 800 });

        // Load content
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for fonts to load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Capture screenshot
        const screenshot = await page.screenshot({
            type: 'png',
            encoding: 'binary'
        });

        await browser.close();
        browser = null;

        // Save to local public directory
        const photocardDir = path.join(process.cwd(), 'public', 'photocards');

        // Ensure directory exists
        if (!fs.existsSync(photocardDir)) {
            fs.mkdirSync(photocardDir, { recursive: true });
        }

        // Generate filename
        const filename = `event-${event.id}-${Date.now()}.png`;
        const filepath = path.join(photocardDir, filename);

        // Save file
        fs.writeFileSync(filepath, screenshot);

        // Return relative URL for portability and to avoid mixed content issues
        return `/photocards/${filename}`;

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error generating photocard:', error);
        throw error;
    }
}

function formatBengaliDate(date: Date | string): string {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();

    const bengaliMonths = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];

    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

    const toBengaliDigits = (num: number) =>
        String(num).split('').map(digit => bengaliDigits[parseInt(digit)]).join('');

    return `${toBengaliDigits(day)} ${bengaliMonths[month]} ${toBengaliDigits(year)}`;
}

function extractSources(event: PoliticalEvent): string {
    const sources = [event.source];

    if (event.additionalSources) {
        try {
            const additional = JSON.parse(event.additionalSources);
            if (Array.isArray(additional)) {
                sources.push(...additional.map((s: any) => s.source || s).filter(Boolean));
            }
        } catch (e) {
            // Ignore parsing errors
        }
    }

    return sources.filter(Boolean).slice(0, 3).join(', ') || 'Unknown';
}
