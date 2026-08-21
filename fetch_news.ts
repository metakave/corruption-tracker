import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const articles = await prisma.rawNewsArticle.findMany({
    where: { isProcessed: false },
    take: 10,
    select: {
      id: true,
      title: true,
      content: true,
      publishedAt: true,
      source: true,
      url: true
    }
  })
  const fs = require('fs');
  fs.writeFileSync('./news_to_test.json', JSON.stringify(articles, null, 2));
  console.log('DONE_FETCHING');
}
main().catch(console.error).finally(() => prisma.$disconnect())
