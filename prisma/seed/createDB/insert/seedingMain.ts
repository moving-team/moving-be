import { prisma } from '../../helper/helperDB';
import { seedDatabase } from './userSeed';
import { seedMovingInfo } from './movingInfoSeed';
import { seedEstimateRequests } from './estimateRequestSeed';
import { seedAssignedEstimateRequests } from './assignedEstimateRequestSeed';
import { seedEstimates } from './estimateSeed';
import { seedReviews } from './reviewSeed';
import { seedFavorites } from './favoriteSeed';
import { setConfirmationCounts } from './confirmationCountSet';
// export const prisma = new PrismaClient();

export const CONCURRENCY_LIMIT = 1; // 비동기 큐 최대 동시 실행 작업 수

export async function seedingMain() {
  console.log('🚀 모든 시딩 작업을 순차적으로 실행합니다.\n');

  const seedFunctions = [
    { name: 'User Seed', func: seedDatabase },
    { name: 'Moving Info Seed', func: seedMovingInfo },
    { name: 'Estimate Request Seed', func: seedEstimateRequests },
    { name: 'Assigned Estimate Request Seed', func: seedAssignedEstimateRequests },
    { name: 'Estimate Seed', func: seedEstimates },
    { name: 'Review Seed', func: seedReviews },
    { name: 'Favorite Seed', func: seedFavorites },
    { name: 'Confirmation Count Set', func: setConfirmationCounts },
  ];

  for (const { name, func } of seedFunctions) {
    console.log(`⚙️ 실행 중: ${name}`);
    try {
      await func();
      console.log(`✅ ${name} 완료.\n`);
    } catch (error) {
      console.error(`❌ ${name} 실행 중 오류 발생:`, error);
    }
  }
}

if (require.main === module) {
  seedingMain()
    .then(() => {
      console.log('✨ 모든 시딩 작업이 성공적으로 완료되었습니다.');
    })
    .catch((error) => {
      console.error('❌ 전체 시딩 작업 중 오류 발생:', error);
    })
    .finally(async () => {
      try {
        console.log('🔌 Prisma 클라이언트 연결을 해제합니다.');
        await prisma.$disconnect();
        console.log('✔️ 연결이 안전하게 해제되었습니다.');
      } catch (disconnectError) {
        console.error('❌ Prisma 연결 해제 중 오류 발생:', disconnectError);
      }
    });
}