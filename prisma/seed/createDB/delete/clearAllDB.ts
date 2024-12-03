import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('Starting database cleanup...');

    // 데이터 삭제 순서에 주의: FK 제약 조건을 고려하여 순차적으로 삭제
    await prisma.review.deleteMany({});
    console.log('Reviews cleared.');

    await prisma.favorite.deleteMany({});
    console.log('Favorites cleared.');

    await prisma.estimate.deleteMany({});
    console.log('Estimates cleared.');

    await prisma.assignedEstimateRequest.deleteMany({});
    console.log('AssignedEstimateRequests cleared.');

    await prisma.estimateRequest.deleteMany({});
    console.log('EstimateRequests cleared.');

    await prisma.mover.deleteMany({});
    console.log('Movers cleared.');

    await prisma.customer.deleteMany({});
    console.log('Customers cleared.');

    await prisma.user.deleteMany({});
    console.log('Users cleared.');

    console.log('Database cleanup completed successfully.');
  } catch (error) {
    console.error('Error during database cleanup:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

clearDatabase();
