module.exports = {
    apps: [
        {
            name: 'political-violence-tracker',
            script: 'npm',
            args: 'start',
            cwd: '/var/www/political_violence_tracker',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        },
        {
            name: 'auto-scraper',
            script: 'npx',
            args: 'tsx scripts/crawler.ts',
            cwd: '/var/www/political_violence_tracker',
            instances: 1,
            autorestart: false, // Don't auto-restart, only run on cron
            watch: false,
            // Cron pattern: Run at 05:00, 08:00, 13:00, and 17:00 UTC (11:00 AM, 02:00 PM, 07:00 PM, 11:00 PM BD Time)
            cron_restart: '0 5,8,13,17 * * *',
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
}
