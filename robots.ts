import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin-db/', '/api/'], // Protect admin and API routes
        },
        sitemap: 'https://violencetracker.org/sitemap.xml',
    }
}
