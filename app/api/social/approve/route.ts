import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { postToFacebook } from '@/lib/services/facebook';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { postId } = body;

        if (!postId) {
            return NextResponse.json({ error: 'postId is required' }, { status: 400 });
        }

        // Get the post
        const post = await prisma.socialMediaPost.findUnique({
            where: { id: postId },
            include: { event: true }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (post.status !== 'PENDING') {
            return NextResponse.json({ error: 'Post is not pending' }, { status: 400 });
        }

        // Update status to approved
        await prisma.socialMediaPost.update({
            where: { id: postId },
            data: {
                status: 'APPROVED',
                reviewedAt: new Date()
            }
        });

        // Post to Facebook (async, don't wait)
        postToFacebook(postId).catch(err => {
            console.error('Error posting to Facebook:', err);
        });

        return NextResponse.json({ success: true, message: 'Post approved and queued for Facebook' });

    } catch (error) {
        console.error('Error approving post:', error);
        return NextResponse.json({ error: 'Failed to approve post' }, { status: 500 });
    }
}
