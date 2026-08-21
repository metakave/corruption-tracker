import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
            where: { id: postId }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (post.status !== 'PENDING') {
            return NextResponse.json({ error: 'Post is not pending' }, { status: 400 });
        }

        // Update status to rejected
        await prisma.socialMediaPost.update({
            where: { id: postId },
            data: {
                status: 'REJECTED',
                reviewedAt: new Date()
            }
        });

        return NextResponse.json({ success: true, message: 'Post rejected' });

    } catch (error) {
        console.error('Error rejecting post:', error);
        return NextResponse.json({ error: 'Failed to reject post' }, { status: 500 });
    }
}
