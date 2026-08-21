const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalCleanup() {
    console.log("🚀 Finalizing duplicate cleanup...");

    // 1. Jan 4 Cluster (Final piece: NEIR Dhaka Post)
    const jan4PrimaryId = '65a9687e-df1e-406e-8904-8c5a3f5a8e19';
    const jan4DupId = '3ed05d0e-daec-46e2-aecf-22f7813c7fc7';

    const jan4Primary = await prisma.politicalEvent.findUnique({ where: { id: jan4PrimaryId } });
    const jan4Dup = await prisma.politicalEvent.findUnique({ where: { id: jan4DupId } });

    if (jan4Primary && jan4Dup) {
        console.log(`Merging ${jan4Dup.title} into ${jan4Primary.title}`);
        const sources = jan4Primary.additionalSources ? JSON.parse(jan4Primary.additionalSources) : [];
        if (!sources.some(s => s.url === jan4Dup.url)) {
            sources.push({ url: jan4Dup.url, source: jan4Dup.source, title: jan4Dup.title });
        }
        await prisma.politicalEvent.update({
            where: { id: jan4PrimaryId },
            data: {
                additionalSources: JSON.stringify(sources),
                updatedAt: new Date()
            }
        });
        await prisma.politicalEvent.delete({ where: { id: jan4DupId } });
        console.log("✅ Jan 4 merged NEIR successfully.");
    }

    // 2. Jan 1 Cluster (BTRC Attack)
    const btrcId = 'aa30ab9b-c2c5-4f0c-b529-6fd141481468';
    const btrcEvent = await prisma.politicalEvent.findUnique({ where: { id: btrcId } });

    if (btrcEvent) {
        console.log(`Updating BTRC event summary and sources...`);
        const btrcSummary = "২০২৬ সালের ১ জানুয়ারি মোবাইল ফোন খুচরা ব্যবসায়ীদের একটি অংশ এনইআইআর (NEIR) সিস্টেম চালুর প্রতিবাদে আগারগাঁওয়ে বিটিআরসি (BTRC) ভবনে হামলা ও ভাঙচুর চালায়। বিক্ষোভকারীরা ভবনের কাঁচ ভেঙে ফেলে এবং সরকারি সম্পত্তিতে বিশৃঙ্খলা সৃষ্টি করে। ব্যবসায়ীদের দাবি ছিল শুল্ক কমানো এবং এনইআইআর ব্যবস্থা শিথিল করা।";

        // Ensure Dhaka Post source is in there if not already
        const sources = btrcEvent.additionalSources ? JSON.parse(btrcEvent.additionalSources) : [];
        const dhakaPostUrl = 'https://www.dhakapost.com/technology/421550';
        if (!sources.some(s => s.url === dhakaPostUrl)) {
            sources.push({
                url: dhakaPostUrl,
                source: 'Dhaka Post',
                title: 'শুল্ক কমানোর দিনে বিটিআরসি বা সরকারি প্রতিষ্ঠানে হামলা'
            });
        }

        await prisma.politicalEvent.update({
            where: { id: btrcId },
            data: {
                summary: btrcSummary,
                additionalSources: JSON.stringify(sources),
                district: 'ঢাকা',
                dateOfIncident: new Date('2026-01-01T12:00:00Z'),
                updatedAt: new Date()
            }
        });
        console.log("✅ BTRC event updated.");
    }

    console.log("\nCleanup Finished!");
}

finalCleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
