interface PoliticalEvent {
    id: string;
    title: string;
    dateOfIncident: Date | null;
    publishedAt: Date;
    district: string | null;
    killed: number | null;
    injured: number | null;
    summary: string | null;
    category: string | null;
}

export async function generateCaption(event: PoliticalEvent): Promise<string> {
    const title = event.title;
    const summary = event.summary || '';
    const district = event.district || 'Bangladesh';
    const killed = event.killed || 0;
    const injured = event.injured || 0;

    // Build caption parts
    let caption = `${title}\n\n`;

    // Add summary if available and different from title
    if (summary && summary !== title) {
        caption += `${summary}\n\n`;
    }

    // Add casualty info if significant
    if (killed > 0 || injured > 0) {
        const casualties = [];
        if (killed > 0) casualties.push(`${toBengaliNumber(killed)} জন নিহত`);
        if (injured > 0) casualties.push(`${toBengaliNumber(injured)} জন আহত`);
        caption += `${casualties.join(', ')}\n\n`;
    }

    // Add link
    caption += `বিস্তারিত: https://violencetracker.org\n\n`;

    // Add hashtags
    const hashtags = [
        '#ViolenceTracker',
        '#Bangladesh',
        `#${district.replace(/\s+/g, '')}`
    ];

    if (event.category) {
        hashtags.push(`#${event.category.replace(/\s+/g, '').replace(/\//g, '')}`);
    }

    caption += hashtags.join(' ');

    return caption;
}

function toBengaliNumber(num: number): string {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).split('').map(digit =>
        /\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit
    ).join('');
}
