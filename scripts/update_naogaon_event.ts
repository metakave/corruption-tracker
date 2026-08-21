import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const eventId = '60b567e2-6cb3-47f8-843d-dcb57e8eff5b';
  const targetDistrict = 'Naogaon';
  const targetSource = 'Ittefaq';

  console.log('Updating event ' + eventId + ' to district ' + targetDistrict);

  const updated = await prisma.politicalEvent.update({
    where: { id: eventId },
    data: {
      district: targetDistrict,
      // Optional: update source if needed, but user said 'just district shows unknown, fix it'
      // But they also listed 'Ittefaq' in the block, so I will update source too to be helpful/complete if it is 'Local Source' or something.
      source: targetSource,
    }
  });

  console.log('Updated event:', updated);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
