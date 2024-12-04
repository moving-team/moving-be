import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('Starting database cleanup...');

    // 데이터 삭제 순서에 따라 데이터 삭제
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

    await prisma.movingInfo.deleteMany({});
    console.log('MovingInfo cleared.');

    await prisma.mover.deleteMany({});
    console.log('Movers cleared.');

    await prisma.customer.deleteMany({});
    console.log('Customers cleared.');

    await prisma.user.deleteMany({});
    console.log('Users cleared.');

    await prisma.notification.deleteMany({});
    console.log('Notifications cleared.');

    // PostgreSQL 시퀀스 초기화
    console.log('Resetting ID sequences...');
    await prisma.$executeRaw`ALTER SEQUENCE "mover_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "user_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "customer_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "review_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "moving_info_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "estimate_requests_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "assigned_estimate_request_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "estimate_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "favorite_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "notification_id_seq" RESTART WITH 1;`;

    console.log('ID sequences 1로 초기화');

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
