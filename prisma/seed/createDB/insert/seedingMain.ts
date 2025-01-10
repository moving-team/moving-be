import { prisma } from '../../helper/helperDB';
import { seedDatabase } from './userSeed';
import { seedMovingInfo } from './movingInfoSeed';
import { seedEstimateRequests } from './estimateRequestSeed';
import { seedAssignedEstimateRequests } from './assignedEstimateRequestSeed';
import { seedEstimates } from './estimateSeed';
import { seedReviews } from './reviewSeed';
import { seedFavorites } from './favoriteSeed';
import { setConfirmationCounts } from './confirmationCountSet';

// createData
import { createUser } from '../createUser';
import { createMovingInfo } from '../createMovingInfo';
import { createEstimateRequest } from '../createEstimateRequest';
import { createAssignedEstimateRequest } from '../createAssigendEstimateRequest';
import { createEstimate } from '../createEstimate';
import { createReview } from '../createReview';
import { createFavorite } from '../createFavorite';

export const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수


export async function seedingMain(isTest: boolean = false) {
  console.log('🚀 모든 시딩 작업을 순차적으로 실행합니다.\n');

  const seedFunctions = [
    { name: 'Create Users', func: createUser, params: [isTest] },
    { name: 'User Seed', func: seedDatabase },

    { name: 'Create Moving Info', func: createMovingInfo, params: [isTest]  },
    { name: 'Moving Info Seed', func: seedMovingInfo },

    { name: 'Create Estimate Requests', func: createEstimateRequest },
    { name: 'Estimate Request Seed', func: seedEstimateRequests },

    { name: 'Create Assigned Estimate Requests', func: createAssignedEstimateRequest },
    { name: 'Assigned Estimate Request Seed', func: seedAssignedEstimateRequests },

    { name: 'Create Estimates', func: createEstimate },
    { name: 'Estimate Seed', func: seedEstimates },

    { name: 'Create Reviews', func: createReview },
    { name: 'Review Seed', func: seedReviews },

    { name: 'Create Favorites', func: createFavorite },
    { name: 'Favorite Seed', func: seedFavorites },

    { name: 'Confirmation Count Set', func: setConfirmationCounts },
  ];

  for (const { name, func, params } of seedFunctions) {
    console.log(`⚙️ 실행 중: ${name}`);
    try {
      await func(...(params || []));
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