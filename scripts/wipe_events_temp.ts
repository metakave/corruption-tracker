import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); async function main() { await prisma.politicalEvent.deleteMany({}); console.log('Wiped.'); } main();
