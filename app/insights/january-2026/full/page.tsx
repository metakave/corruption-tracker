import fs from 'fs';
import path from 'path';
import ReportViewer from '@/components/ReportViewer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'January 2026 Violence Report - Full Detail | Violence Tracker',
    description: 'Detailed report of political violence incidents in January 2026, including casualty breakdown and incident types.',
};

export default function FullReportPage() {
    const reportsDir = path.join(process.cwd(), 'reports');
    // Note: Filename for full report is "Brief Description..." based on user statement
    const englishContent = fs.readFileSync(path.join(reportsDir, 'Brief Description January 2026 Violence Report_English.md'), 'utf-8');
    const banglaContent = fs.readFileSync(path.join(reportsDir, 'Brief Description January 2026 Violence Report_Bangla.md'), 'utf-8');

    const quickLinks = [
        { key: 'category_political_violence', enHash: '#political-violence', bnHash: '#রাজনৈতিক-সহিংসতা' },
        { key: 'category_mob_justice', enHash: '#mob-justice', bnHash: '#মব-জাস্টিস' },
        { key: 'category_communal_violence', enHash: '#communal-violence', bnHash: '#সাম্প্রদায়িক-সহিংসতা' },
        { key: 'category_gender_based_violence', enHash: '#gender-based-violence', bnHash: '#জেন্ডার-ভিত্তিক-সহিংসতা' },
        { key: 'category_criminal_violence', enHash: '#criminal-violence', bnHash: '#অপরাধমূলক-সহিংসতা' },
        { key: 'category_terrorism_extremism', enHash: '#terrorism--extremism', bnHash: '#সন্ত্রাসবাদ--চরমপন্থা' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <ReportViewer
                englishContent={englishContent}
                banglaContent={banglaContent}
                quickLinks={quickLinks}
            />
        </div>
    );
}
