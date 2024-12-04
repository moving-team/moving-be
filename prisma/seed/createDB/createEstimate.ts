import { PrismaClient } from '@prisma/client';
import { getRandomResponseComment } from '../generate/generateResComment';
import * as fs from 'fs';

const prisma = new PrismaClient();

const createCount = 5000; // 총 생성 개수
const maxUnassignedPerCustomer = 5; // 최대 5개의 isAssigned = false
const maxAssignedPerCustomer = 3;  // 최대 3개의 isAssigned = true

type Estimate = {
  customerId: number;
  moverId: number;
  estimateRequestId: number;
  movingInfoId: number;
  isAssigned: boolean;
  isMovingComplete: boolean;
  price: number;
  status: string;
  comment?: string;
  createdAt: Date;
};

async function generateEstimates(): Promise<void> {
  try {
    console.log('Start generating Estimate data...');

    // 데이터베이스에서 필요한 데이터 가져오기
    const customers = await prisma.customer.findMany({
      select: { id: true },
    });

    const movers = await prisma.mover.findMany({
      select: { id: true },
    });

    const estimateRequests = await prisma.estimateRequest.findMany({
      include: { MovingInfo: true }, // MovingInfo 데이터 포함
    });

    const assignedRequests = await prisma.assignedEstimateRequest.findMany({
      select: { estimateRequestId: true, isRejected: true },
    });

    if (
      customers.length === 0 ||
      movers.length === 0 ||
      estimateRequests.length === 0
    ) {
      throw new Error('No valid data found in the database for generating estimates.');
    }

    // 데이터 매핑
    const customerIds = customers.map((customer) => customer.id);
    const moverIds = movers.map((mover) => mover.id);
    const requestMap = estimateRequests.map((req) => ({
      estimateRequestId: req.id,
      movingInfoId: req.MovingInfo.id,
      movingDate: new Date(req.MovingInfo.movingDate),
      movingType: req.MovingInfo.movingType,
      createdAt: req.createdAt,
    }));

    // AssignedEstimateRequest 매핑
    const assignedRequestMap: Record<number, { isRejected: boolean }> = {};
    assignedRequests.forEach((req) => {
      assignedRequestMap[req.estimateRequestId] = { isRejected: req.isRejected };
    });

    // 생성할 Estimate 데이터
    const estimates: Estimate[] = [];
    const customerEstimates: Record<number, { assigned: number; unassigned: number }> =
      {};

    // 고객별 estimate 갯수 초기화
    customerIds.forEach((id) => {
      customerEstimates[id] = { assigned: 0, unassigned: 0 };
    });

    for (let i = 0; i < createCount; i++) {
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
      const moverId = moverIds[Math.floor(Math.random() * moverIds.length)];
      const request = requestMap[Math.floor(Math.random() * requestMap.length)];

      // AssignedEstimateRequest 확인
      const assignedInfo = assignedRequestMap[request.estimateRequestId];

      // isAssigned 상태 결정
      let isAssigned = false;
      if (assignedInfo && customerEstimates[customerId].assigned < maxAssignedPerCustomer) {
        isAssigned = true;
        customerEstimates[customerId].assigned++;
      } else if (!assignedInfo && customerEstimates[customerId].unassigned < maxUnassignedPerCustomer) {
        customerEstimates[customerId].unassigned++;
      } else {
        continue; // 이 고객에 대해 더 이상 생성 불가능
      }

      // status 결정
      let status = 'WAITING';
      if (isAssigned) {
        if (assignedInfo?.isRejected) {
          status = 'REJECTED';
        } else {
          status = Math.random() < 0.3 ? 'ACCEPTED' : 'WAITING';
        }
      } else {
        status = Math.random() < 0.3 ? 'ACCEPTED' : 'WAITING';
      }

      // isMovingComplete 상태 결정
      const isMovingComplete = request.movingDate < new Date();

      estimates.push({
        customerId,
        moverId,
        estimateRequestId: request.estimateRequestId,
        movingInfoId: request.movingInfoId,
        isAssigned,
        isMovingComplete,
        price: getWeightedRandomPrice(request.movingType), // 가중치 기반 가격
        status,
        comment: getRandomResponseComment(),
        createdAt: new Date(request.createdAt),
      });
    }

    // JSON 파일로 저장
    const filePath = './data/estimates.json';
    fs.writeFileSync(filePath, JSON.stringify(estimates, null, 2), 'utf-8');

    console.log(`Estimate data has been saved to ${filePath}`);
  } catch (error) {
    console.error('Error during Estimate data generation:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

// 가중치 기반 가격 생성 함수
function getWeightedRandomPrice(movingType: string): number {
  const priceOptions = Array.from({ length: 91 }, (_, i) => 100000 + i * 10000); // 100,000 ~ 1,000,000
  const weights: number[] = [];

  switch (movingType) {
    case 'SMALL':
      weights.push(...priceOptions.map((price) => (price <= 300000 ? 7 : 1))); // 30만원 이하에 가중치 5
      break;
    case 'HOUSE':
      weights.push(...priceOptions.map((price) => (price > 300000 && price <= 800000 ? 3 : 1))); // 중간 금액에 가중치 3
      break;
    case 'OFFICE':
      weights.push(...priceOptions.map((price) => (price > 750000 ? 4 : 1))); // 60만원 이상에 가중치 4
      break;
    default:
      weights.push(...priceOptions.map(() => 1)); // 기본 균등 분포
  }

  const weightedPrices = priceOptions.flatMap((price, index) =>
    Array(weights[index]).fill(price)
  );

  const randomIndex = Math.floor(Math.random() * weightedPrices.length);
  return weightedPrices[randomIndex];
}

// 실행
generateEstimates();
