
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration of photocard URLs...');

    try {
        // Find all posts where photocardUrl starts with 'http'
        const posts = await prisma.socialMediaPost.findMany({
            where: {
                photocardUrl: {
                    startsWith: 'http',
                },
            },
        });

        console.log(`Found ${posts.length} posts with absolute URLs.`);

        let updatedCount = 0;
        let errorCount = 0;

        for (const post of posts) {
            try {
                const url = new URL(post.photocardUrl);
                // We only want to keep the pathname, e.g., /photocards/event-123.png
                const relativePath = url.pathname;

                if (relativePath.startsWith('/photocards/')) {
                    await prisma.socialMediaPost.update({
                        where: { id: post.id },
                        data: { photocardUrl: relativePath },
                    });
                    console.log(`Updated post ${post.id}: ${post.photocardUrl} -> ${relativePath}`);
                    updatedCount++;
                } else {
                    console.warn(`Skipping post ${post.id}: URL path ${relativePath} does not start with /photocards/`);
                }
            } catch (error) {
                console.error(`Error processing post ${post.id} with URL ${post.photocardUrl}:`, error);
                errorCount++;
            }
        }

        console.log('Migration complete.');
        console.log(`Successfully updated: ${updatedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
