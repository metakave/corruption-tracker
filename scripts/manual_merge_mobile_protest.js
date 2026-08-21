const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDuplicates() {
    console.log("🚀 Starting manual duplicate cleanup...");

    // 1. Jan 4 Cluster: Mobile Businessmen Protest
    // Primary: মুঠোফোন ব্যবসায়ীদের বিক্ষোভে পুলিশের টিয়ারশেল ও ধাওয়া-পাল্টা
    const primaryId = '65a9687e-df1e-406e-8904-8c5a3f5a8e19';
    const duplicateIds = [
        'e5981b77-8a3c-4dc4-b54c-2c538ff442a5', // কারওয়ান বাজারে...
        'b35a2fb6-8291-4bfd-9bb9-030a053ddf6d', // মুঠোফোন ব্যবসায়ীদের আন্দোলনে... (Video)
        '96174a74-d92e-4b72-878f-695c0228742d'  // এনইআইআর চালুতে অসন্তোষ... (Dhaka Post)
    ];

    const primary = await prisma.politicalEvent.findUnique({ where: { id: primaryId } });
    if (!primary) {
        console.error("❌ Primary event for Jan 4 not found!");
    } else {
        console.log(`Merging into: ${primary.title}`);

        const sources = primary.additionalSources ? JSON.parse(primary.additionalSources) : [];

        // Comprehensive Bengali summary
        const unifiedSummary = "২০২৬ সালের ৪ জানুয়ারি কারওয়ান বাজার এবং আগারগাঁও এলাকায় মুঠোফোন ব্যবসায়ীরা এনইআইআর (NEIR) ব্যবস্থা চালুর প্রতিবাদে এবং বিটিআরসি ভবনে হামলার ঘটনায় গ্রেপ্তার ব্যক্তিদের মুক্তির দাবিতে বিক্ষোভ ও অবরোধ করেন। সার্ক ফোয়ারা মোড়ে ব্যবসায়ীরা অবরোধ করলে পুলিশ লাঠিপেটা, কাঁদানে গ্যাস (টিয়ারশেল), জলকামান ও সাউন্ড গ্রেনেড ব্যবহার করে তাদের ছত্রভঙ্গ করে দেয়। এ সময় পুলিশের সাথে ব্যবসায়ীদের পাল্টাপাল্টি ধাওয়ার ঘটনা ঘটে এবং পুলিশ কয়েকজনকে আটক করে।";

        for (const id of duplicateIds) {
            const dup = await prisma.politicalEvent.findUnique({ where: { id } });
            if (dup) {
                console.log(` - Adding source from: ${dup.title}`);
                // Add dup's primary source to additionalSources
                if (!sources.some(s => s.url === dup.url)) {
                    sources.push({ url: dup.url, source: dup.source, title: dup.title });
                }
                // Add any existing additionalSources from the dup
                if (dup.additionalSources) {
                    const dupSources = JSON.parse(dup.additionalSources);
                    dupSources.forEach(ds => {
                        if (!sources.some(s => s.url === ds.url)) {
                            sources.push(ds);
                        }
                    });
                }
            }
        }

        // Update primary
        await prisma.politicalEvent.update({
            where: { id: primaryId },
            data: {
                summary: unifiedSummary,
                additionalSources: JSON.stringify(sources),
                district: 'ঢাকা', // Ensure district is set
                updatedAt: new Date()
            }
        });
        console.log("✅ Jan 4 Primary updated.");

        // Delete duplicates
        for (const id of duplicateIds) {
            try {
                await prisma.politicalEvent.delete({ where: { id } });
                console.log(`✅ Deleted duplicate: ${id}`);
            } catch (e) {
                console.log(`⚠️ ID ${id} might have already been deleted or not found.`);
            }
        }
    }

    console.log("\nCleanup Finished!");
}

cleanDuplicates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
