export interface ScrapedArticle {
    url: string
    title: string
    time: string // Raw time string from source
    rawTime: string // Explicit raw time field for consistency
    source: string
    content?: string
    images?: string[]
    publishedAt?: string
}

export interface NewsSourceScraper {
    name: string
    baseUrl: string
    scrape(dateLimit?: Date): Promise<ScrapedArticle[]>
}
