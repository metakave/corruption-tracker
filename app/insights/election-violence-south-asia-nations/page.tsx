import type { Metadata } from 'next';
import SouthAsiaInsightClient from './SouthAsiaInsightClient';

export const metadata: Metadata = {
    title: "দক্ষিণ এশিয়ায় নির্বাচন ও সহিংসতা | Violence Tracker",
    description: "ভারত, পাকিস্তান, বাংলাদেশ, শ্রীলঙ্কা ও নেপালে নির্বাচন কেন্দ্রিক সহিংসতার ইতিহাস, কারণ ও প্রভাব নিয়ে বিস্তারিত বিশ্লেষণ।",
    openGraph: {
        title: "দক্ষিণ এশিয়ায় নির্বাচন ও সহিংসতা | Violence Tracker",
        description: "দক্ষিণ এশিয়ার দেশগুলোতে নির্বাচনের সময় ঘটা রাজনৈতিক সংঘাত ও সহিংসতার গভীর বিশ্লেষণ।",
        type: 'article',
        url: 'https://violencetracker.org/insights/election-violence-south-asia-nations',
        images: ['/images/logo-bn.png'], // Falling back to logo
        locale: 'bn_BD',
        alternateLocale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: "দক্ষিণ এশিয়ায় নির্বাচন ও সহিংসতা",
        description: "দক্ষিণ এশিয়ার নির্বাচনী সহিংসতার ইতিহাস ও বর্তমান প্রেক্ষাপট।",
    },
    other: {
        "geo.region": "BD",
        "geo.placename": "South Asia",
        "geo.position": "23.685;90.3563",
        "ICBM": "23.685, 90.3563"
    }
};

export default function SouthAsiaInsightPage() {
    // Structured Data for SEO
    const articleLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'দক্ষিণ এশিয়ায় নির্বাচন ও সহিংসতা',
        description: 'দক্ষিণ এশিয়ার রাজনীতি ও নির্বাচনের সাথে সহিংসতার গভীর সম্পর্ক নিয়ে বিস্তারিত প্রবন্ধ।',
        image: ['https://violencetracker.org/images/logo-bn.png'],
        author: {
            '@type': 'Organization',
            name: 'Violence Tracker BD',
            url: 'https://violencetracker.org'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Violence Tracker BD',
            logo: {
                '@type': 'ImageObject',
                url: 'https://violencetracker.org/images/logo-bn.png'
            }
        },
        datePublished: '2026-02-11T14:00:00+06:00',
        dateModified: '2026-02-11T14:00:00+06:00',
        inLanguage: 'bn',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': 'https://violencetracker.org/insights/election-violence-south-asia-nations'
        },
        keywords: "Election Violence, South Asia, India, Pakistan, Bangladesh, Lanka, Nepal, Democracy, Conflict",
        contentLocation: {
            '@type': 'Place',
            name: 'South Asia'
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
            />
            <SouthAsiaInsightClient />
        </>
    );
}
