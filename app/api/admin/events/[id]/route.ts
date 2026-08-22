
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Next.js 15+ async params
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validate body (basic)
        if (!id) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        console.log(`📝 Updating Event ${id} Payload:`, JSON.stringify(body, null, 2));

        // Prepare update data
        const updateData: any = {};

        if (body.title !== undefined) updateData.title = body.title;
        if (body.summary !== undefined) updateData.summary = body.summary;
        if (body.killed !== undefined) updateData.killed = parseInt(body.killed);
        if (body.injured !== undefined) updateData.injured = parseInt(body.injured);
        if (body.isPoliticalViolence !== undefined) updateData.isPoliticalViolence = body.isPoliticalViolence;
        if (body.url !== undefined) updateData.url = body.url; // Primary source URL
        if (body.source !== undefined) updateData.source = body.source; // Source name
        if (body.additionalSources !== undefined) updateData.additionalSources = body.additionalSources; // Additional sources JSON
        if (body.category !== undefined) updateData.category = body.category; // Violence category
        if (body.tags !== undefined) updateData.tags = body.tags; // Tags (comma-separated)
        if (body.district !== undefined) updateData.district = body.district; // Allow district update

        // Handle Date (Local to UTC or keep as string if using simple date)
        if (body.date) {
            updateData.dateOfIncident = new Date(body.date);
        }

        // Handle Parties (Array -> String or JSON)
        if (body.politicalParties !== undefined) {
            // Ensure it's stored consistently as a JSON string or array depending on DB schema
            // Based on previous issues, it seems DB might store it as a stringified JSON if using SQLite/Postgres text, 
            // or true array if using Postgres text[]. 
            // Looking at schema.prisma earlier: `politicalParties String?`
            // So we must stringify it.
            updateData.politicalParties = JSON.stringify(body.politicalParties);
        }

        const updatedEvent = await prisma.corruptionEvent.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, event: updatedEvent });

    } catch (error) {
        console.error('Update Event API Error:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        console.log(`🗑️ Deleting Event ${id}`);

        await prisma.corruptionEvent.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Event deleted successfully' });

    } catch (error) {
        console.error('Delete Event API Error:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
