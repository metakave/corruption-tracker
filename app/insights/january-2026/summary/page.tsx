import fs from 'fs';
import path from 'path';
import ReportViewer from '@/components/ReportViewer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'January 2026 Violence Report - Summary | Violence Tracker',
    description: 'Short summary of political violence incidents in January 2026, covering key statistics and geographical analysis.',
};

export default function SummaryPage() {
    const reportsDir = path.join(process.cwd(), 'reports');
    const englishContent = fs.readFileSync(path.join(reportsDir, 'January 2026 Violence Report_Short Summary_English.md'), 'utf-8');
    const banglaContent = fs.readFileSync(path.join(reportsDir, 'January 2026 Violence Report_Short Summary_Bangla.md'), 'utf-8');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <ReportViewer englishContent={englishContent} banglaContent={banglaContent} />
        </div>
    );
}
