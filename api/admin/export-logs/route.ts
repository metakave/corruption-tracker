import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prodPath = '/var/www/political_violence_tracker/logs/audit_trail.csv';
        const localPath = path.join(process.cwd(), 'logs/audit_trail.csv');

        let filePath = localPath;
        if (fs.existsSync(prodPath)) {
            filePath = prodPath;
        }

        if (!fs.existsSync(filePath)) {
            return new NextResponse('Log file not found', { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="audit_trail_logs_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error) {
        return new NextResponse('Error reading logs', { status: 500 });
    }
}
