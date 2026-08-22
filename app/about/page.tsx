import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
    title: "About Us | Sadiq M Alam & Musfiqur Tuhin",
    description: "Learn about the team behind Bangladesh Violence Tracker. Founded by Sadiq M Alam and Musfiqur Tuhin to monitor political and social violence using AI.",
    keywords: [
        // Core Project Keywords
        "Bangladesh Violence Tracker", "Political Violence Data", "Election Violence Monitoring",

        // Person 1: Sadiq M Alam - Variations
        "Sadiq M Alam", "Sadiq Mohammad Alam", "Sadiq Alam", "Sadik Mohammad Alam",
        "Sadik Alam", "Sadeq Alam", "Sadiqur Rahman", "Sadiq M. Alam", "M. Sadiq Alam",
        "Sadiq Mohammad", "Sadik M Alam", "Sadik M. Alam",

        // Person 1: Bangla Variations
        "সাদিক এম আলম", "সাদিক মোহাম্মদ আলম", "সাদিক আলম", "মোহাম্মদ সাদিক", "সাদিক মোহাম্মদ",
        "সাদিকুর রহমান", "সাদেক আলম",

        // Person 2: Md. Musfiqur Rahman (Tuhin) - Variations
        "Md. Musfiqur Rahman", "Md. Musfiqur Rahman Tuhin", "Musfiqur Rahman Tuhin", "Musfiq Tuhin",
        "Tuhin Rahman", "Musfiqur Tuhin", "Md Musfiqur Rahman", "M. Musfiqur Rahman",
        "M. M. Rahman", "Musfiqur R. Tuhin", "Tuhin Musfiqur",
        "Mushfiqur Rahman", "Mushfiq Tuhin", "Mosfiqur Rahman", "Mosfikur Rahman",
        "Musfikur Rahman", "Musfik Tuhin", "Moshfiqur Rahman", "Musfiqur Rahaman",
        "Musfiqur Rehman", "Musfiqr Rahman", "Mufiqur Rahman", "Musfiqur Rahmn",
        "Md. Musfiqur Rhaman", "Musfiqur Tuhon", "Tuheen", "Tohin",

        // Person 2: Bangla Variations
        "মোঃ মুশফিকুর রহমান", "মুশফিকুর রহমান তুহিন", "মুশফিক তুহিন", "মুসফিকুর রহমান",
        "মুসফিক তুহিন", "মোঃ মুসফিকুর রহমান", "মো: মুশফিকুর রহমান", "মুশফিকুর রাহমান",
        "তুহিন", "মুশফিক"
    ],
    openGraph: {
        title: "About Us | Sadiq M Alam & Musfiqur Tuhin",
        description: "Meet the founders: Sadiq M Alam and Musfiqur Tuhin.",
        type: 'profile',
        images: ['https://violencetracker.org/images/sadiq.jpg']
    }
}

export default function AboutPage() {
    // Person 1 Schema: Sadiq M Alam
    const sadiqSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Sadiq M Alam",
        "alternateName": [
            "Sadiq Mohammad Alam", "Sadiq Alam", "Sadik Mohammad Alam", "Sadik Alam",
            "Sadeq Alam", "Sadiqur Rahman", "Sadiq M. Alam", "M. Sadiq Alam",
            "Sadiq Mohammad", "Sadik M Alam", "Sadik M. Alam",
            "সাদিক এম আলম", "সাদিক মোহাম্মদ আলম", "সাদিক আলম", "মোহাম্মদ সাদিক",
            "সাদিক মোহাম্মদ", "সাদিকুর রহমান", "সাদেক আলম"
        ],
        "jobTitle": "Founder & Head of Ideas",
        "worksFor": {
            "@type": "Organization",
            "name": "Bangladesh Violence Tracker"
        },
        "url": "https://sadiqalam.com",
        "image": "https://violencetracker.org/images/sadiq.jpg",
        "sameAs": [
            "https://sadiqalam.com"
        ]
    }

    // Person 2 Schema: Md. Musfiqur Rahman (Tuhin)
    const tuhinSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Md. Musfiqur Rahman",
        "alternateName": [
            "Md. Musfiqur Rahman Tuhin", "Musfiqur Rahman Tuhin", "Musfiq Tuhin", "Tuhin Rahman",
            "Musfiqur Tuhin", "Md Musfiqur Rahman", "M. Musfiqur Rahman", "M. M. Rahman",
            "Musfiqur R. Tuhin", "Tuhin Musfiqur", "Mushfiqur Rahman", "Mushfiq Tuhin",
            "Mosfiqur Rahman", "Mosfikur Rahman", "Musfikur Rahman", "Musfik Tuhin",
            "Moshfiqur Rahman", "Musfiqur Rahaman", "Musfiqur Rehman", "Tuheen", "Tohin",
            "মোঃ মুশফিকুর রহমান", "মুশফিকুর রহমান তুহিন", "মুশফিক তুহিন", "মুসফিকুর রহমান",
            "মুসফিক তুহিন", "মোঃ মুসফিকুর রহমান", "মো: মুশফিকুর রহমান", "মুশফিকুর রাহমান",
            "তুহিন", "মুশফিক"
        ],
        "jobTitle": "Co-Founder & Lead Engineer",
        "worksFor": {
            "@type": "Organization",
            "name": "Bangladesh Violence Tracker"
        },
        "url": "https://musfiqurtuhin.me",
        "image": "https://violencetracker.org/images/tuhin.jpg",
        "knowsAbout": ["Political Violence", "Artificial Intelligence", "Research", "Data Science"],
        "sameAs": [
            "https://scholar.google.com/citations?user=yLdzv6IAAAAJ&hl=en",
            "https://www.linkedin.com/in/mdmusfiqurrahmantuhin/",
            "https://github.com/MusfiqurTuhin",
            "https://www.behance.net/musfiqurtuhin",
            "https://www.fiverr.com/musfiqur_",
            "https://twitter.com/Musfiqur_Tuhin",
            "https://www.facebook.com/TuhinMusfiqur",
            "https://www.instagram.com/musfiqur___tuhin/",
            "https://www.youtube.com/@musfiqurtuhin",
            "https://bn.quora.com/profile/Musfiqur-Tuhin",
            "https://t.me/musfiqurtuhin",
            "https://wa.me/+8801521563251",
            "mailto:musfiqurrahmantuhin@gmail.com"
        ]
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([sadiqSchema, tuhinSchema]) }}
            />
            <AboutClient />
        </>
    )
}
