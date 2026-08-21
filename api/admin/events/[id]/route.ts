
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

        console.log(`📝 Updating Event ${id}:`, body);

        // Prepare update data
        const updateData: any = {};

        if (body.title !== undefined) updateData.title = body.title;
        if (body.summary !== undefined) updateData.summary = body.summary;
        if (body.killed !== undefined) updateData.killed = parseInt(body.killed);
        if (body.injured !== undefined) updateData.injured = parseInt(body.injured);
        if (body.isPoliticalViolence !== undefined) updateData.isPoliticalViolence = body.isPoliticalViolence;

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

        const updatedEvent = await prisma.politicalEvent.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, event: updatedEvent });

    } catch (error) {
        console.error('Update Event API Error:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}
