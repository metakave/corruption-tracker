import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generatePhotocard } from '@/lib/services/photocard-generator';
import { generateCaption } from '@/lib/services/caption-generator';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventId, theme = 'classic', regenerate = false } = body;

        if (!eventId) {
            return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
        }

        // Fetch event details
        const event = await prisma.politicalEvent.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Check if already generated (unless regenerate is true)
        if (!regenerate) {
            const existing = await prisma.socialMediaPost.findFirst({
                where: {
                    eventId,
                    status: { not: 'REJECTED' }
                }
            });

            if (existing) {
                return NextResponse.json({
                    message: 'Post already generated',
                    post: existing
                });
            }
        }

        // Generate photocard
        const photocardUrl = await generatePhotocard(event, theme);

        // Generate caption
        const caption = await generateCaption(event);

        // Create database record
        const socialPost = await prisma.socialMediaPost.create({
            data: {
                eventId,
                photocardUrl,
                caption,
                theme,
                status: 'PENDING'
            }
        });

        return NextResponse.json({
            success: true,
            post: socialPost
        });

    } catch (error) {
        console.error('Error generating social media post:', error);
        return NextResponse.json(
            { error: 'Failed to generate social media post' },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch pending posts
export async function GET() {
    try {
        const pending = await prisma.socialMediaPost.findMany({
            where: { status: 'PENDING' },
            include: {
                event: {
                    select: {
                        title: true,
                        district: true,
                        dateOfIncident: true,
                        killed: true,
                        injured: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({ posts: pending });
    } catch (error) {
        console.error('Error fetching pending posts:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
