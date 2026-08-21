import { prisma } from '@/lib/db';

interface FacebookConfig {
    pageId: string;
    accessToken: string;
}

const FB_CONFIG: FacebookConfig = {
    pageId: process.env.FACEBOOK_PAGE_ID || '',
    accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || ''
};

const FB_API_BASE = 'https://graph.facebook.com/v19.0';

export async function postToFacebook(postId: string): Promise<void> {
    try {
        // Get the post from database
        const post = await prisma.socialMediaPost.findUnique({
            where: { id: postId },
            include: { event: true }
        });

        if (!post) {
            throw new Error('Post not found');
        }

        if (post.status !== 'APPROVED') {
            throw new Error('Post is not approved');
        }

        // Upload photo to Facebook
        const photoResponse = await fetch(`${FB_API_BASE}/${FB_CONFIG.pageId}/photos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: post.photocardUrl,
                caption: post.caption,
                published: true,
                access_token: FB_CONFIG.accessToken
            })
        });

        if (!photoResponse.ok) {
            const error = await photoResponse.json();
            throw new Error(`Facebook API error: ${JSON.stringify(error)}`);
        }

        const photoData = await photoResponse.json();

        // Update database with Facebook post info
        await prisma.socialMediaPost.update({
            where: { id: postId },
            data: {
                status: 'POSTED',
                postedAt: new Date(),
                facebookPostId: photoData.id,
                facebookUrl: `https://facebook.com/${photoData.id}`
            }
        });

        console.log(`✅ Posted to Facebook: ${photoData.id}`);

    } catch (error) {
        console.error('Error posting to Facebook:', error);

        // Update status to failed
        await prisma.socialMediaPost.update({
            where: { id: postId },
            data: { status: 'FAILED' }
        });

        throw error;
    }
}

export async function getPostInsights(facebookPostId: string) {
    try {
        const response = await fetch(
            `${FB_API_BASE}/${facebookPostId}/insights?metric=post_impressions,post_engaged_users&access_token=${FB_CONFIG.accessToken}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch insights');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching post insights:', error);
        return null;
    }
}

export async function updatePostAnalytics(postId: string) {
    try {
        const post = await prisma.socialMediaPost.findUnique({
            where: { id: postId }
        });

        if (!post?.facebookPostId) {
            return;
        }

        // Fetch post data from Facebook
        const response = await fetch(
            `${FB_API_BASE}/${post.facebookPostId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${FB_CONFIG.accessToken}`
        );

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        // Update database
        await prisma.socialMediaPost.update({
            where: { id: postId },
            data: {
                likes: data.likes?.summary?.total_count || 0,
                comments: data.comments?.summary?.total_count || 0,
                shares: data.shares?.count || 0
            }
        });

    } catch (error) {
        console.error('Error updating analytics:', error);
    }
}
