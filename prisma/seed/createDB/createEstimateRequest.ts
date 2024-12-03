import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { getRandomComment } from '../generate/generateReqComment';

const prisma = new PrismaClient();

// MovingInfo 데이터 타입
type MovingInfo = {
  id: number;
  movingDate: string;
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

// Weighted random customer ID selection
function getWeightedRandomCustomerId(customerIds: number[]): number {
  const weightedIds: number[] = [];

  customerIds.forEach((id) => {
    const weight = id > 450 ? 7 : 3; // 가중치 설정
    for (let i = 0; i < weight; i++) {
      weightedIds.push(id);
    }
  });

  // 가중치가 적용된 배열에서 랜덤하게 ID 선택
  const randomIndex = Math.floor(Math.random() * weightedIds.length);
  return weightedIds[randomIndex];
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

    // EstimateRequest 데이터 생성
    const estimateRequests: EstimateRequest[] = movingInfoData.map((movingInfo) => {
      const customerId = getWeightedRandomCustomerId(customerIds); // 가중치 기반 랜덤 ID 선택
      const movingDate = new Date(movingInfo.movingDate); // MovingInfo의 MovingDate 기준
      const isFuture = movingDate > new Date(); // MovingDate가 미래인지?
      const isConfirmed =
        isFuture && Math.random() <= 0.3 ? true : movingDate <= new Date();
      const isCancelled = !isConfirmed && Math.random() <= 0.1;

      return {
        customerId,
        movingInfoId: movingInfo.id,
        comment: getRandomComment(),
        isConfirmed,
        isCancelled,
        createdAt: movingInfo.createdAt,
      };
    });

    // JSON 파일로 저장
    const filePath = './data/estimateRequest.json';
    fs.writeFileSync(filePath, JSON.stringify(estimateRequests, null, 2), 'utf-8');

    console.log(`EstimateRequest data has been saved to ${filePath}`);
  } catch (error) {
    console.error('Error during EstimateRequest data generation:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

generateEstimateRequest();
