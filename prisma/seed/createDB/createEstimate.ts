import { PrismaClient } from '@prisma/client';
import { getRandomResponseComment } from '../generate/getResComment';
import * as fs from 'fs';

const prisma = new PrismaClient();

type Estimate = {
  estimateRequestId: number;
  moverId: number;
  customerId: number;
  isAssigned: boolean;
  price: number;
  status: 'WAITING' | 'ACCEPTED' | 'REJECTED';
  isMovingComplete: boolean;
  comment: string;
  movingInfoId: number; // movingInfoId 추가
  createdAt: Date;
};


// 랜덤 가격 생성 함수 (가중치 적용, 1만 단위)
function getWeightedRandomPrice(
  min: number,
  max: number,
  breakpoint: number,
  highWeight: number
): number {
  const isBelowBreakpoint = Math.random() < highWeight;
  const price = isBelowBreakpoint
    ? Math.random() * (breakpoint - min + 1) + min
    : Math.random() * (max - breakpoint + 1) + breakpoint;
  return Math.round(price / 10000) * 10000; // 1만 단위로 변환
}


// MovingType에 따른 가격 생성
function getPriceByMovingType(movingType: 'SMALL' | 'HOUSE' | 'OFFICE'): number {
  switch (movingType) {
    case 'SMALL':
      return getWeightedRandomPrice(90000, 500000, 300000, 0.7);
    case 'HOUSE':
      return getWeightedRandomPrice(250000, 1000000, 600000, 0.6);
    case 'OFFICE':
      return getWeightedRandomPrice(500000, 1500000, 700000, 0.3);
    default:
      throw new Error(`Invalid movingType: ${movingType}`);
  }
}

// 가중치 기반 값 선택 함수
function getWeightedRandomValue(values: number[], weights: number[]): number {
  const cumulativeWeights = weights.map(
    ((sum) => (weight) => (sum += weight))(0)
  );
  const random = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];

  return values[cumulativeWeights.findIndex((weight) => random <= weight)];
}


// 랜덤 시간 생성
function getRandomCreatedAt(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


// EstimateRequest 처리 함수
function processEstimateRequests(
  requests: any[],
  movers: any[],
  assignedEstimateRequests: any[],
  estimates: Estimate[],
  isPast: boolean
): void {
  console.log(
    `Processing ${requests.length} EstimateRequests (${isPast ? 'Past' : 'Future'})...`
  );

  requests.forEach((request, index) => {
    const customerId = request.customerId;
    const movingDate = new Date(request.MovingInfo.movingDate.replace(/\./g, '-').trim());
    const startCreatedAt = new Date(request.createdAt);
    const endCreatedAt = new Date(
      Math.min(new Date().getTime(), movingDate.getTime() - 86400000)
    );

    // 요청 진행 상태를 한 줄로 표시
    process.stdout.write(
      `Processing request ${index + 1}/${requests.length}: Moving Date: ${movingDate}\r`
    );

    // 가중치 기반으로 maxAssigned와 maxUnassigned 결정
    const maxAssigned = getWeightedRandomValue([0, 1, 2, 3], [0.05, 0.3, 0.4, 0.25]); 
    const maxUnassigned = getWeightedRandomValue([0, 1, 2, 3, 4, 5], [0.05, 0.1, 0.3, 0.2, 0.2, 0.15]); 

    let assignedCount = 0;
    let unassignedCount = 0;

    let loopGuard = 0; // 안전한 루프 종료를 위한 카운터
    const loopLimit = 1000; // 루프 제한
    
    while (assignedCount < maxAssigned || unassignedCount < maxUnassigned) {
      loopGuard++;
      if (loopGuard > loopLimit) {
        console.log(
          `Loop exceeded limit for request ${request.id}. AssignedCount: ${assignedCount}, UnassignedCount: ${unassignedCount}\r`
        );
        break; // 안전하게 루프 종료
      }
    
      const randomMover = movers[Math.floor(Math.random() * movers.length)];
      const randomCreatedAt = getRandomCreatedAt(startCreatedAt, endCreatedAt);

      const isAssigned = assignedEstimateRequests.some(
        (assigned) =>
          assigned.estimateRequestId === request.id && assigned.moverId === randomMover.id
      );

      if (isAssigned && assignedCount >= maxAssigned) continue;
      if (!isAssigned && unassignedCount >= maxUnassigned) continue;

      let status: 'WAITING' | 'ACCEPTED' | 'REJECTED';

      if (isPast) {
        if (assignedCount === 0 && Math.random() < 0.5) {
          status = 'ACCEPTED';
          assignedCount++;
        } else {
          status = 'REJECTED';
        }
      } else {
        if (unassignedCount === 0) {
          status = 'WAITING';
        } else if (Math.random() < 0.25) {
          status = 'REJECTED';
        } else {
          status = 'WAITING';
        }
      }

      const isMovingComplete = status === 'ACCEPTED' && isPast;

      estimates.push({
        estimateRequestId: request.id,
        moverId: randomMover.id,
        customerId,
        isAssigned,
        price: getPriceByMovingType(request.MovingInfo.movingType),
        status,
        isMovingComplete,
        comment: getRandomResponseComment(),
        movingInfoId: request.MovingInfo.id, // movingInfoId 추가
        createdAt: randomCreatedAt,
      });

      if (isAssigned) {
        assignedCount++;
      } else {
        unassignedCount++;
      }
    }
  });

  console.log(
    `Finished processing ${requests.length} EstimateRequests (${isPast ? 'Past' : 'Future'})`
  );
}

// 주 함수: Estimate 생성
async function generateEstimates(): Promise<void> {
  const now = new Date();

  try {
    console.log('Start generating Estimate data...');

    // 모든 EstimateRequest 가져오기
    const estimateRequests = await prisma.estimateRequest.findMany({
      include: {
        Customer: true,
        MovingInfo: true,
      },
    });

    const movers = await prisma.mover.findMany();
    const assignedEstimateRequests = await prisma.assignedEstimateRequest.findMany();

    if (estimateRequests.length === 0 || movers.length === 0) {
      throw new Error('No EstimateRequest or Mover data found in the database.');
    }

    const estimates: Estimate[] = [];

    // 과거와 미래 요청 분리
    const pastRequests = estimateRequests.filter((request) => {
      const movingDate = new Date(request.MovingInfo.movingDate.replace(/\./g, '-').trim());
      return movingDate <= now; // 과거 요청
    });

    const futureRequests = estimateRequests.filter((request) => {
      const movingDate = new Date(request.MovingInfo.movingDate.replace(/\./g, '-').trim());
      return movingDate > now; // 미래 요청
    });

    // 로깅: 요청 개수 출력
    console.log(`Total EstimateRequests: ${estimateRequests.length}`);
    console.log(`Future EstimateRequests: ${futureRequests.length}`);
    console.log(`Past EstimateRequests: ${pastRequests.length}`);

    // 과거 요청 처리
    processEstimateRequests(pastRequests, movers, assignedEstimateRequests, estimates, true);

    // 미래 요청 처리
    processEstimateRequests(futureRequests, movers, assignedEstimateRequests, estimates, false);

    // JSON 파일로 저장
    const estimateFilePath = './data/estimates.json';
    fs.writeFileSync(estimateFilePath, JSON.stringify(estimates, null, 2), 'utf-8');
    console.log(`${estimates.length}개의 Estimate 데이터가 생성되었습니다.`);
    console.log(`Estimate 데이터가 ${estimateFilePath}에 저장되었습니다.`);
  } catch (error) {
    console.error('Error during Estimate data generation:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

// 실행
generateEstimates();





// import { PrismaClient } from '@prisma/client';
// import { getRandomResponseComment } from '../generate/getResComment';
// import * as fs from 'fs';

// const prisma = new PrismaClient();

// // Estimate 타입 정의
// type Estimate = {
//   estimateRequestId: number;
//   moverId: number;
//   customerId: number;
//   isAssigned: boolean;
//   price: number;
//   status: 'WAITING' | 'ACCEPTED' | 'REJECTED';
//   isMovingComplete: boolean;
//   comment: string;
//   createdAt: Date;
// };

// // 랜덤 가격 생성 함수 (가중치 적용, 1만 단위)
// function getWeightedRandomPrice(
//   min: number,
//   max: number,
//   breakpoint: number,
//   highWeight: number
// ): number {
//   const isBelowBreakpoint = Math.random() < highWeight;
//   let price;
//   if (isBelowBreakpoint) {
//     // Generate a price below or equal to the breakpoint
//     price = Math.random() * (breakpoint - min + 1) + min;
//   } else {
//     // Generate a price above the breakpoint
//     price = Math.random() * (max - breakpoint + 1) + breakpoint;
//   }
//   return Math.round(price / 10000) * 10000; // 1만 단위로 변환
// }

// // MovingType에 따른 가격 생성
// function getPriceByMovingType(movingType: 'SMALL' | 'HOUSE' | 'OFFICE'): number {
//   switch (movingType) {
//     case 'SMALL':
//       return getWeightedRandomPrice(90000, 500000, 300000, 0.7); // 30만 이하가 70% 확률
//     case 'HOUSE':
//       return getWeightedRandomPrice(250000, 1000000, 600000, 0.6); // 60만 이하가 60% 확률
//     case 'OFFICE':
//       return getWeightedRandomPrice(500000, 1500000, 700000, 0.3); // 70만 이상이 70% 확률
//     default:
//       throw new Error(`Invalid movingType: ${movingType}`);
//   }
// }

// // yyyy. mm. dd 형식으로 변환하는 함수
// function formatDateToDbFormat(date: Date): string {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}. ${month}. ${day}`; // "yyyy. mm. dd" 형식
// }


// async function generateEstimates(): Promise<void> {
//   const today = formatDateToDbFormat(new Date()); // 현재 날짜를 DB 형식으로 변환
//   try {
//     console.log('Start generating Estimate data...');

//     // 조건에 맞는 EstimateRequest 가져오기
//     const estimateRequests = await prisma.estimateRequest.findMany({
//       where: {
//         isConfirmed: false,
//         MovingInfo: {
//           movingDate: {
//             gt: today, // 미래 날짜
//           },
//         },
//       },
//       include: {
//         Customer: true,
//         MovingInfo: true,
//       },
//     });

//     // 모든 Mover 가져오기
//     const movers = await prisma.mover.findMany();

//     // 모든 AssignedEstimateRequest 가져오기
//     const assignedEstimateRequests = await prisma.assignedEstimateRequest.findMany();

//     if (estimateRequests.length === 0 || movers.length === 0) {
//       throw new Error('No EstimateRequest or Mover data found in the database.');
//     }

//     const estimates: Estimate[] = [];
//     const now = new Date(); // 현재 시간

//     for (const request of estimateRequests) {
//       const customerId = request.customerId;
//       const movingDate = new Date(request.MovingInfo.movingDate.replace(/\./g, '-').trim());
//       const startCreatedAt = new Date(request.createdAt);
//       const endCreatedAt = new Date(movingDate.getTime() - 86400000); // MovingDate - 1일

//       const isPast = movingDate <= now; // 이미 지난 날짜인지 확인
//       let acceptedCount = 0; // ACCEPTED 상태 개수 추적

//       // 랜덤으로 Estimate 개수 생성 (1 ~ 5개)
//       const estimateCount = Math.floor(Math.random() * 5) + 1;

//       for (let i = 0; i < estimateCount; i++) {
//         const randomMover = movers[Math.floor(Math.random() * movers.length)];
//         const randomCreatedAt = getRandomCreatedAt(startCreatedAt, endCreatedAt);

//         // 현재 시간 초과 시 스킵
//         if (!randomCreatedAt) continue;

//         // `isAssigned` 상태 결정 (AssignedEstimateRequest 기반)
//         const isAssigned = assignedEstimateRequests.some(
//           (assigned) =>
//             assigned.estimateRequestId === request.id && assigned.moverId === randomMover.id
//         );

//         // 상태 설정
//         let status: 'WAITING' | 'ACCEPTED' | 'REJECTED';

//         if (isPast) {
//           // MovingDate가 과거인 경우
//           if (acceptedCount === 0 && Math.random() < 0.5) {
//             status = 'ACCEPTED';
//             acceptedCount++;
//           } else {
//             status = 'REJECTED';
//           }
//         } else {
//           // MovingDate가 미래인 경우
//           if (i === 0) {
//             // 첫 번째 Estimate는 무조건 WAITING
//             status = 'WAITING';
//           } else if (Math.random() < 0.3) {
//             status = 'REJECTED'; // 30% 확률로 REJECTED
//           } else {
//             status = 'WAITING'; // 70% 확률로 WAITING
//           }
//         }

//         // isMovingComplete 설정
//         const isMovingComplete = status === 'ACCEPTED' && isPast;

//         estimates.push({
//           estimateRequestId: request.id,
//           moverId: randomMover.id,
//           customerId,
//           isAssigned,
//           price: getPriceByMovingType(request.MovingInfo.movingType), // MovingType에 따라 가격 결정
//           status,
//           isMovingComplete,
//           comment: getRandomResponseComment(),
//           createdAt: randomCreatedAt,
//         });
//       }
//     }

//     // JSON 파일로 저장
//     const estimateFilePath = './data/estimates.json';
//     fs.writeFileSync(estimateFilePath, JSON.stringify(estimates, null, 2), 'utf-8');
//     console.log(`${estimates.length}개의 Estimate 데이터가 생성되었습니다.`);
//     console.log(`Estimate 데이터가 ${estimateFilePath}에 저장되었습니다.`);
//   } catch (error) {
//     console.error('Error during Estimate data generation:', error);
//   } finally {
//     await prisma.$disconnect();
//     console.log('Prisma client disconnected.');
//   }
// }

// // 랜덤 시간 생성 (현재를 초과하지 않도록)
// function getRandomCreatedAt(start: Date, end: Date): Date | null {
//   const randomTime = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
//   return randomTime > new Date() ? null : randomTime;
// }

// generateEstimates();

//////////////////////////////////////////////////////


// import { PrismaClient } from '@prisma/client';
// import { getRandomResponseComment } from '../generate/getResComment';
// import * as fs from 'fs';

// const prisma = new PrismaClient();

// const createCount = 5000; // 총 생성 개수
// const maxUnassignedPerCustomer = 5; // 최대 5개의 isAssigned = false
// const maxAssignedPerCustomer = 3;  // 최대 3개의 isAssigned = true

// type Estimate = {
//   customerId: number;
//   moverId: number;
//   estimateRequestId: number;
//   movingInfoId: number;
//   isAssigned: boolean;
//   isMovingComplete: boolean;
//   price: number;
//   status: string;
//   comment?: string;
//   createdAt: Date;
// };

// async function generateEstimates(): Promise<void> {
//   try {
//     console.log('Start generating Estimate data...');

//     // 데이터베이스에서 필요한 데이터 가져오기
//     const customers = await prisma.customer.findMany({
//       select: { id: true },
//     });

//     const movers = await prisma.mover.findMany({
//       select: { id: true },
//     });

//     const estimateRequests = await prisma.estimateRequest.findMany({
//       include: { MovingInfo: true }, // MovingInfo 데이터 포함
//     });

//     const assignedRequests = await prisma.assignedEstimateRequest.findMany({
//       select: { estimateRequestId: true, isRejected: true },
//     });

//     if (
//       customers.length === 0 ||
//       movers.length === 0 ||
//       estimateRequests.length === 0
//     ) {
//       throw new Error('No valid data found in the database for generating estimates.');
//     }

//     // 데이터 매핑
//     const customerIds = customers.map((customer) => customer.id);
//     const moverIds = movers.map((mover) => mover.id);
//     const requestMap = estimateRequests.map((req) => ({
//       estimateRequestId: req.id,
//       movingInfoId: req.MovingInfo.id,
//       movingDate: new Date(req.MovingInfo.movingDate),
//       movingType: req.MovingInfo.movingType,
//       createdAt: req.createdAt,
//     }));

//     // AssignedEstimateRequest 매핑
//     const assignedRequestMap: Record<number, { isRejected: boolean }> = {};
//     assignedRequests.forEach((req) => {
//       assignedRequestMap[req.estimateRequestId] = { isRejected: req.isRejected };
//     });

//     // 생성할 Estimate 데이터
//     const estimates: Estimate[] = [];
//     const customerEstimates: Record<number, { assigned: number; unassigned: number }> =
//       {};

//     // 고객별 estimate 갯수 초기화
//     customerIds.forEach((id) => {
//       customerEstimates[id] = { assigned: 0, unassigned: 0 };
//     });

//     for (let i = 0; i < createCount; i++) {
//       const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
//       const moverId = moverIds[Math.floor(Math.random() * moverIds.length)];
//       const request = requestMap[Math.floor(Math.random() * requestMap.length)];

//       // AssignedEstimateRequest 확인
//       const assignedInfo = assignedRequestMap[request.estimateRequestId];

//       // isAssigned 상태 결정
//       let isAssigned = false;
//       if (assignedInfo && customerEstimates[customerId].assigned < maxAssignedPerCustomer) {
//         isAssigned = true;
//         customerEstimates[customerId].assigned++;
//       } else if (!assignedInfo && customerEstimates[customerId].unassigned < maxUnassignedPerCustomer) {
//         customerEstimates[customerId].unassigned++;
//       } else {
//         continue; // 이 고객에 대해 더 이상 생성 불가능
//       }

//       // status 결정
//       let status = 'WAITING';
//       if (isAssigned) {
//         if (assignedInfo?.isRejected) {
//           status = 'REJECTED';
//         } else {
//           status = Math.random() < 0.3 ? 'ACCEPTED' : 'WAITING';
//         }
//       } else {
//         status = Math.random() < 0.3 ? 'ACCEPTED' : 'WAITING';
//       }

//       // isMovingComplete 상태 결정
//       const isMovingComplete = request.movingDate < new Date();

//       estimates.push({
//         customerId,
//         moverId,
//         estimateRequestId: request.estimateRequestId,
//         movingInfoId: request.movingInfoId,
//         isAssigned,
//         isMovingComplete,
//         price: getWeightedRandomPrice(request.movingType), // 가중치 기반 가격
//         status,
//         comment: getRandomResponseComment(),
//         createdAt: new Date(request.createdAt),
//       });
//     }

//     // JSON 파일로 저장
//     const filePath = './data/estimates.json';
//     fs.writeFileSync(filePath, JSON.stringify(estimates, null, 2), 'utf-8');

//     console.log(`Estimate data has been saved to ${filePath}`);
//   } catch (error) {
//     console.error('Error during Estimate data generation:', error);
//   } finally {
//     await prisma.$disconnect();
//     console.log('Prisma client disconnected.');
//   }
// }

// // 가중치 기반 가격 생성 함수
// function getWeightedRandomPrice(movingType: string): number {
//   const priceOptions = Array.from({ length: 91 }, (_, i) => 100000 + i * 10000); // 100,000 ~ 1,000,000
//   const weights: number[] = [];

//   switch (movingType) {
//     case 'SMALL':
//       weights.push(...priceOptions.map((price) => (price <= 300000 ? 7 : 1))); // 30만원 이하에 가중치 5
//       break;
//     case 'HOUSE':
//       weights.push(...priceOptions.map((price) => (price > 300000 && price <= 800000 ? 3 : 1))); // 중간 금액에 가중치 3
//       break;
//     case 'OFFICE':
//       weights.push(...priceOptions.map((price) => (price > 750000 ? 4 : 1))); // 60만원 이상에 가중치 4
//       break;
//     default:
//       weights.push(...priceOptions.map(() => 1)); // 기본 균등 분포
//   }

//   const weightedPrices = priceOptions.flatMap((price, index) =>
//     Array(weights[index]).fill(price)
//   );

//   const randomIndex = Math.floor(Math.random() * weightedPrices.length);
//   return weightedPrices[randomIndex];
// }

// // 실행
// generateEstimates();
