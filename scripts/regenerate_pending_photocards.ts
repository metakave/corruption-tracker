
import { PrismaClient } from '@prisma/client';
import { generatePhotocard } from '../lib/services/photocard-generator';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting regeneration of PENDING photocards...');

    try {
        const pendingPosts = await prisma.socialMediaPost.findMany({
            where: {
                status: 'PENDING',
            },
            include: {
                event: true,
            },
        });

        console.log(`Found ${pendingPosts.length} pending posts.`);

        for (const post of pendingPosts) {
            console.log(`Regenerating photocard for post ${post.id} (Event: ${post.event.title})...`);

            try {
                // cast theme to expected type
                const theme = (post.theme as 'classic' | 'dark' | 'crimson' | 'ocean' | 'newspaper') || 'classic';

                // Generate new photocard
                const newUrl = await generatePhotocard(post.event, theme);

                // Update database with new URL
                await prisma.socialMediaPost.update({
                    where: { id: post.id },
                    data: { photocardUrl: newUrl },
                });

                console.log(`✅ Updated post ${post.id}: ${newUrl}`);
            } catch (error) {
                console.error(`❌ Failed to regenerate post ${post.id}:`, error);
            }
        }

        console.log('Regeneration process complete.');

    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
