import { PrismaClient } from '@prisma/client';
import { getRandomRejectionReason } from '../generate/generateRejectReason';
import * as fs from 'fs';

const prisma = new PrismaClient();

const createCount = 900;

type AssignedEstimateRequest = {
  estimateRequestId: number;
  moverId: number;
  isRejected: boolean;
  rejectionReason?: string;
  createdAt: Date;
};

// 랜덤 시간 생성 (1 ~ 72시간 뒤)
function getRandomFutureDate(baseDate: Date): Date {
  const randomHours = Math.floor(Math.random() * (72 - 1 + 1)) + 1; // 1~72 시간
  const futureDate = new Date(baseDate);
  futureDate.setHours(futureDate.getHours() + randomHours);
  return futureDate;
}

// 가중치 기반 MoverId 선택
function getWeightedRandomMoverId(moverIds: number[]): number {
  const weightedMoverIds: number[] = [];

  moverIds.forEach((moverId) => {
    const weight = moverId > 200 ? 7 : 1; // 200 이상: 가중치 7, 그 외: 가중치 1
    for (let i = 0; i < weight; i++) {
      weightedMoverIds.push(moverId);
    }
  });

  // 가중치가 적용된 배열에서 랜덤 선택
  const randomIndex = Math.floor(Math.random() * weightedMoverIds.length);
  return weightedMoverIds[randomIndex];
}

// 랜덤 유니크 ID 선택
function getRandomUniqueId(availableIds: number[]): number {
  const randomIndex = Math.floor(Math.random() * availableIds.length);
  const selectedId = availableIds[randomIndex];
  availableIds.splice(randomIndex, 1); // 선택된 ID 제거
  return selectedId;
}

async function generateAssignedEstimateRequest(createCount: number): Promise<void> {
  try {
    console.log('Start generating AssignedEstimateRequest data...');

    // EstimateRequest와 Mover 데이터 가져오기
    const estimateRequests = await prisma.estimateRequest.findMany({
      select: { id: true, createdAt: true },
    });

    const movers = await prisma.mover.findMany({
      select: { id: true },
    });

    if (estimateRequests.length === 0 || movers.length === 0) {
      throw new Error('No EstimateRequest or Mover data found in the database.');
    }

    const moverIds = movers.map((mover) => mover.id);
    const availableEstimateRequestIds = estimateRequests.map((req) => req.id);

    // 최대 생성 개수 조정
    const adjustedCount = Math.min(createCount, availableEstimateRequestIds.length);

    // AssignedEstimateRequest 데이터 생성
    const assignedRequests: AssignedEstimateRequest[] = [];
    for (let i = 0; i < adjustedCount; i++) {
      const estimateRequestId = getRandomUniqueId(availableEstimateRequestIds); // 유니크 ID 선택
      const moverId = getWeightedRandomMoverId(moverIds); // 가중치 기반 MoverId 선택
      const isRejected = Math.random() <= 0.25; // 25% 확률로 거절
      const rejectionReason = isRejected ? getRandomRejectionReason() : undefined;

      // 선택된 EstimateRequest의 createdAt 가져오기
      const estimateRequest = estimateRequests.find((req) => req.id === estimateRequestId);

      if (!estimateRequest) {
        throw new Error(`EstimateRequest with ID ${estimateRequestId} not found.`);
      }

      assignedRequests.push({
        estimateRequestId,
        moverId,
        isRejected,
        rejectionReason,
        createdAt: getRandomFutureDate(new Date(estimateRequest.createdAt)),
      });
    }

    // JSON 파일로 저장
    const filePath = './data/assignedEstimateRequest.json';
    fs.writeFileSync(filePath, JSON.stringify(assignedRequests, null, 2), 'utf-8');

    console.log(`AssignedEstimateRequest data has been saved to ${filePath}`);
  } catch (error) {
    console.error('Error during AssignedEstimateRequest data generation:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

// 생성 개수를 조정
generateAssignedEstimateRequest(createCount);
