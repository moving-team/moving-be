import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { getRandomComment } from '../generate/getReqComment';

const prisma = new PrismaClient();

// MovingInfo 데이터 타입
type MovingInfo = {
  id: number;
  movingDate: Date; // DateTime으로 변경
  createdAt: Date;
};

// Customer 데이터 타입
type Customer = {
  id: number;
};

// EstimateRequest 데이터 타입
type EstimateRequest = {
  customerId: number;
  movingInfoId: number;
  comment: string;
  isConfirmed: boolean;
  isCancelled: boolean;
  createdAt: Date;
};

// 랜덤 정수 생성 (최소값 포함, 최대값 포함)
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 기존 고객 중 임의의 고객 선택
function getRandomCustomerId(customerIds: number[]): number {
  const randomIndex = Math.floor(Math.random() * customerIds.length);
  return customerIds[randomIndex];
}

async function generateEstimateRequest(): Promise<void> {
  try {
    console.log('Start generating EstimateRequest data...');

    // MovingInfo 데이터 가져오기
    const movingInfoData: MovingInfo[] = await prisma.movingInfo.findMany({
      select: { id: true, movingDate: true, createdAt: true },
    });

    // Customer ID 가져오기
    const customers: Customer[] = await prisma.customer.findMany({
      select: { id: true },
    });
    const customerIds = customers.map((customer) => customer.id);

    if (movingInfoData.length === 0 || customerIds.length === 0) {
      throw new Error('No MovingInfo or Customer data found in the database.');
    }

    // 각 customerId별 EstimateRequest 생성 제한 개수 설정
    const customerEstimateLimits: Map<number, number> = new Map();
    customerIds.forEach((id) =>
      customerEstimateLimits.set(id, getRandomInt(1, 20))
    );

    const estimateRequests: EstimateRequest[] = [];
    const today = new Date();

    for (let i = 0; i < movingInfoData.length; i++) {
      const movingInfo = movingInfoData[i];
      let customerId = getRandomCustomerId(customerIds); // 랜덤 고객 선택

      // 고객 ID 순환으로 제한 조건을 무시
      while (true) {
        const currentRequestCount = estimateRequests.filter(
          (req) => req.customerId === customerId
        ).length;

        // 제한을 초과하지 않았거나 무시할 때 해당 고객에 요청 생성
        if (
          currentRequestCount < (customerEstimateLimits.get(customerId) || 0)
        ) {
          break;
        }

        // 제한 초과 시 다른 랜덤 고객 선택
        customerId = getRandomCustomerId(customerIds);
      }

      // MovingDate와 현재 날짜를 고려한 상태 결정
      const isFuture = movingInfo.movingDate > today;
      const isConfirmed = isFuture
        ? Math.random() <= 0.2 // 확률적 true
        : Math.random() <= 0.97; // 확률적 true
      const isCancelled = !isConfirmed && Math.random() <= 0.1;

      // 새로운 EstimateRequest 생성
      estimateRequests.push({
        customerId,
        movingInfoId: movingInfo.id,
        comment: getRandomComment(),
        isConfirmed,
        isCancelled,
        createdAt: movingInfo.createdAt,
      });

      // 누적 생성 갯수 출력
      process.stdout.write(
        `Processing: ${i + 1}/${movingInfoData.length} EstimateRequests\r`
      );
    }

    // JSON 파일로 저장
    const filePath = './data/estimateRequest.json';
    fs.writeFileSync(
      filePath,
      JSON.stringify(estimateRequests, null, 2),
      'utf-8'
    );

    // 로그 추가: 모든 movingInfo 처리 여부 확인
    console.log(
      `\nAll MovingInfo processed: ${
        movingInfoData.length === estimateRequests.length
      }`
    );
    console.log(
      `Total MovingInfo: ${movingInfoData.length}, Total EstimateRequests: ${estimateRequests.length}`
    );

    console.log(`EstimateRequest data has been saved to ${filePath}`);
  } catch (error) {
    console.error('Error during EstimateRequest data generation:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

// 데이터 생성 실행
generateEstimateRequest();
