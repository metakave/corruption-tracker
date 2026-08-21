import type { Metadata } from 'next';
import VideoInsightsClient from './VideoInsightsClient';

export const metadata: Metadata = {
    title: "Bangladesh Violence Tracker - নির্বাচনকালীন সহিংসতা সম্পর্কে জানবেন কীভাবে?",
    description: "এআই ও ডেটা বিশ্লেষণের মাধ্যমে দেশজুড়ে রাজনৈতিক, মব, ধর্মীয় ও সামাজিক সহিংসতার তথ্য রিয়েল-টাইমে ম্যাপ করছে এই প্ল্যাটফর্ম। নির্বাচনকালীন সহিংসতা নিয়ে সাদিক মোহাম্মদ আলমের আলাপ।",
    openGraph: {
        title: "Bangladesh Violence Tracker - নির্বাচনকালীন সহিংসতা সম্পর্কে জানবেন কীভাবে?",
        description: "এআই ও ডেটা বিশ্লেষণের মাধ্যমে দেশজুড়ে রাজনৈতিক, মব, ধর্মীয় ও সামাজিক সহিংসতার তথ্য রিয়েল-টাইমে ম্যাপ করছে এই প্ল্যাটফর্ম। নির্বাচনকালীন সহিংসতা নিয়ে সাদিক মোহাম্মদ আলমের আলাপ।",
        type: 'article',
        images: ['https://img.youtube.com/vi/ulxulYLe4IE/maxresdefault.jpg'],
        url: 'https://violencetracker.org/insights/bangladesh-election-violence-dhaka-stream-interview',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Bangladesh Violence Tracker - নির্বাচনকালীন সহিংসতা সম্পর্কে জানবেন কীভাবে?",
        description: "এআই ও ডেটা বিশ্লেষণের মাধ্যমে দেশজুড়ে রাজনৈতিক, মব, ধর্মীয় ও সামাজিক সহিংসতার তথ্য রিয়েল-টাইমে ম্যাপ করছে এই প্ল্যাটফর্ম।",
        images: ['https://img.youtube.com/vi/ulxulYLe4IE/maxresdefault.jpg'],
    }
};

export default function VideoInsightsPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: 'নির্বাচনকালীন সহিংসতা সম্পর্কে জানবেন কীভাবে? - Violence Tracker BD',
        description: 'এআই ও ডেটা বিশ্লেষণের মাধ্যমে দেশজুড়ে রাজনৈতিক, মব, ধর্মীয় ও সামাজিক সহিংসতার তথ্য রিয়েল-টাইমে ম্যাপ করছে এই প্ল্যাটফর্ম। নির্বাচন ঘিরে সহিংসতার প্রকৃত চিত্র নিয়ে সাদিক মোহাম্মদ আলমের আলাপ।',
        thumbnailUrl: [
            'https://img.youtube.com/vi/ulxulYLe4IE/maxresdefault.jpg',
            'https://img.youtube.com/vi/ulxulYLe4IE/hqdefault.jpg'
        ],
        uploadDate: '2024-01-20T08:00:00+08:00',
        duration: 'PT15M',
        embedUrl: 'https://www.youtube.com/embed/ulxulYLe4IE',
        interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: { '@type': 'WatchAction' },
            userInteractionCount: 12345
        }
    };

    const articleLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: 'নির্বাচনকালীন সহিংসতা সম্পর্কে জানবেন কীভাবে?',
        image: ['https://img.youtube.com/vi/ulxulYLe4IE/maxresdefault.jpg'],
        datePublished: '2024-01-20T08:00:00+08:00',
        author: [{
            '@type': 'Person',
            name: 'Sadik Mohammad Alam',
            url: 'https://violencetracker.org'
        }]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
            />
            <VideoInsightsClient />
        </>
    );
}
