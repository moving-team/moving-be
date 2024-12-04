import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {

    const result = await prisma.$queryRaw<any>`SHOW timezone;`;
    console.log('Raw Result:', result);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error fetching timezone:', error);
    await prisma.$disconnect();
  }
})();
