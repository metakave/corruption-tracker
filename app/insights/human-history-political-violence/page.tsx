import type { Metadata } from 'next';
import HistoryInsightClient from './HistoryInsightClient';

export const metadata: Metadata = {
    title: "মানুষের ইতিহাসে রাজনৈতিক সহিংসতার ইতিহাস | Violence Tracker",
    description: "প্রাগৈতিহাসিক যুগ থেকে আধুনিক রাষ্ট্র পর্যন্ত রাজনৈতিক সহিংসতার বিবর্তন, রাষ্ট্র-গঠন এবং এর ঐতিহাসিক প্রেক্ষাপট নিয়ে বিস্তারিত আলোচনা।",
    openGraph: {
        title: "মানুষের ইতিহাসে রাজনৈতিক সহিংসতার ইতিহাস | Violence Tracker",
        description: "প্রাগৈতিহাসিক যুগ থেকে আধুনিক রাষ্ট্র পর্যন্ত রাজনৈতিক সহিংসতার বিবর্তন, রাষ্ট্র-গঠন এবং এর ঐতিহাসিক প্রেক্ষাপট নিয়ে বিস্তারিত আলোচনা।",
        type: 'article',
        url: 'https://violencetracker.org/insights/human-history-political-violence',
        images: ['/images/logo-bn.png'], // Falling back to logo or a general image if specific one not provided
        locale: 'bn_BD',
        alternateLocale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: "মানুষের ইতিহাসে রাজনৈতিক সহিংসতার ইতিহাস",
        description: "রাজনৈতিক সহিংসতার ঐতিহাসিক বিবর্তন নিয়ে বিস্তারিত প্রবন্ধ।",
    },
    other: {
        "geo.region": "BD",
        "geo.placename": "Bangladesh",
        "geo.position": "23.685;90.3563",
        "ICBM": "23.685, 90.3563"
    }
};

export default function HistoryInsightPage() {
    // Structured Data for SEO
    const articleLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'মানুষের ইতিহাসে রাজনৈতিক সহিংসতার ইতিহাস',
        description: 'প্রাগৈতিহাসিক যুগ থেকে আধুনিক রাষ্ট্র পর্যন্ত রাজনৈতিক সহিংসতার বিবর্তন নিয়ে বিস্তারিত আলোচনা।',
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
        datePublished: '2026-02-11T12:00:00+06:00',
        dateModified: '2026-02-11T12:00:00+06:00',
        inLanguage: 'bn',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': 'https://violencetracker.org/insights/human-history-political-violence'
        },
        keywords: "Political Violence, History, War, Conflict, Bangladesh, South Asia, UCDP, Terrorism",
        contentLocation: {
            '@type': 'Place',
            name: 'Bangladesh'
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
            />
            <HistoryInsightClient />
        </>
    );
}
