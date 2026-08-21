/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://violencetracker.org',
    generateRobotsTxt: true, // (optional)
    exclude: ['/admin-db', '/admin-db/*'], // Exclude admin routes
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin-db', '/api/*'],
            },
        ],
    },
}
