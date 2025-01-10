import { PrismaClient } from '@prisma/client';
import { getRandomResponseComment } from '../generate/getResComment';
import { getPriceByMovingType } from '../generate/getWeightPrice';
import { getMoverAcceptRate } from '../generate/setMoverWeight';
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
  movingInfoId: number;
  createdAt: Date;
};

// 랜덤 시간 생성
function getRandomCreatedAt(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// 요청별 할당 개수를 결정하는 함수
function determineAssignedCounts(): { assigned: number; unassigned: number } {
  const assignedWeights = [0.1, 0.3, 0.6];
  const unassignedWeights = [0.03, 0.1, 0.23, 0.24, 0.25, 0.15];

  const getWeightedRandom = (values: number[], weights: number[]): number => {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    for (let i = 0; i < values.length; i++) {
      cumulativeWeight += weights[i];
      if (random < cumulativeWeight) return values[i];
    }
    return values[values.length - 1];
  };

  const assigned = getWeightedRandom([1, 2, 3], assignedWeights);
  const unassigned = getWeightedRandom([0, 1, 2, 3, 4, 5], unassignedWeights);

  return { assigned, unassigned };
}

// 가중치 기반 랜덤 Mover 선택
function selectMoversByWeight(movers: any[], moverAcceptRate: Map<number, number>, count: number): any[] {
  const selectedMovers: any[] = [];
  const moversWithWeight = movers.map((mover) => ({
    mover,
    weight: moverAcceptRate.get(mover.id) || 0,
  }));

  while (selectedMovers.length < count && moversWithWeight.length > 0) {
    const totalWeight = moversWithWeight.reduce((sum, item) => sum + item.weight, 0);
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (let i = 0; i < moversWithWeight.length; i++) {
      cumulativeWeight += moversWithWeight[i].weight;
      if (random < cumulativeWeight) {
        const selected = moversWithWeight.splice(i, 1)[0];
        selectedMovers.push(selected.mover);
        break;
      }
    }
  }

  return selectedMovers;
}

// 중복된 moverId를 제거하는 함수
function deduplicateEstimates(estimates: Estimate[]): Estimate[] {
  const uniqueMoverIds = new Set<number>();
  return estimates.filter((estimate) => {
    if (uniqueMoverIds.has(estimate.moverId)) return false;
    uniqueMoverIds.add(estimate.moverId);
    return true;
  });
}

// 과거 요청 처리 함수
function processPastRequests(
  requests: any[],
  movers: any[],
  assignedEstimateRequests: any[],
  estimates: Estimate[]
): void {
  const moverAcceptRate = getMoverAcceptRate(movers);

  requests.forEach((request) => {
    const { assigned, unassigned } = determineAssignedCounts();
    const customerId = request.customerId;
    const movingDate = new Date(request.MovingInfo.movingDate);
    const startCreatedAt = new Date(request.createdAt);
    const endCreatedAt = new Date(Math.min(new Date().getTime(), movingDate.getTime() - 86400000));

    const requestEstimates: Estimate[] = [];

    // Step 1: 전체 Mover에서 랜덤하게 뽑아 Unassigned Estimate 생성
    const unassignedSelectedMovers = selectMoversByWeight(movers, moverAcceptRate, unassigned);
    unassignedSelectedMovers.forEach((mover) => {
      requestEstimates.push({
        estimateRequestId: request.id,
        moverId: mover.id,
        customerId,
        isAssigned: false,
        price: getPriceByMovingType(request.MovingInfo.movingType),
        status: 'REJECTED',
        isMovingComplete: false,
        comment: getRandomResponseComment(),
        movingInfoId: request.MovingInfo.id,
        createdAt: getRandomCreatedAt(startCreatedAt, endCreatedAt),
      });
    });

    // Step 2: AssignedEstimateRequest 기반으로 Assigned Estimate 생성
    const assignedMoverIds = new Set(assignedEstimateRequests.map((req) => req.moverId));
    const assignedMovers = movers.filter((mover) => assignedMoverIds.has(mover.id));
    const assignedSelectedMovers = selectMoversByWeight(assignedMovers, moverAcceptRate, assigned);
    assignedSelectedMovers.forEach((mover) => {
      requestEstimates.push({
        estimateRequestId: request.id,
        moverId: mover.id,
        customerId,
        isAssigned: true,
        price: getPriceByMovingType(request.MovingInfo.movingType),
        status: 'REJECTED',
        isMovingComplete: false,
        comment: getRandomResponseComment(),
        movingInfoId: request.MovingInfo.id,
        createdAt: getRandomCreatedAt(startCreatedAt, endCreatedAt),
      });
    });

    // Step 3: 중복된 moverId 제거
    const uniqueEstimates = deduplicateEstimates(requestEstimates);

    // Step 4: isConfirmed 상태가 true인 경우에만 랜덤하게 하나의 Estimate를 ACCEPT로 변경
    if (request.isConfirmed && uniqueEstimates.length > 0) {
      const randomIndex = Math.floor(Math.random() * uniqueEstimates.length);
      uniqueEstimates[randomIndex].status = 'ACCEPTED';
      uniqueEstimates[randomIndex].isMovingComplete = true;
    }

    estimates.push(...uniqueEstimates);
  });
}

// 미래 요청 처리 함수
function processFutureRequests(
  requests: any[],
  movers: any[],
  assignedEstimateRequests: any[],
  estimates: Estimate[]
): void {
  const moverAcceptRate = getMoverAcceptRate(movers);

  requests.forEach((request) => {
    const { assigned, unassigned } = determineAssignedCounts();
    const customerId = request.customerId;
    const movingDate = new Date(request.MovingInfo.movingDate);
    const startCreatedAt = new Date(request.createdAt);
    const endCreatedAt = movingDate;

    const requestEstimates: Estimate[] = [];

    // Step 1: 전체 Mover에서 랜덤하게 뽑아 Unassigned Estimate 생성
    const unassignedSelectedMovers = selectMoversByWeight(movers, moverAcceptRate, unassigned);
    unassignedSelectedMovers.forEach((mover) => {
      requestEstimates.push({
        estimateRequestId: request.id,
        moverId: mover.id,
        customerId,
        isAssigned: false,
        price: getPriceByMovingType(request.MovingInfo.movingType),
        status: Math.random() < 0.2 ? 'REJECTED' : 'WAITING',
        isMovingComplete: false,
        comment: getRandomResponseComment(),
        movingInfoId: request.MovingInfo.id,
        createdAt: getRandomCreatedAt(startCreatedAt, endCreatedAt),
      });
    });

    // Step 2: AssignedEstimateRequest 기반으로 Assigned Estimate 생성
    const assignedMoverIds = new Set(assignedEstimateRequests.map((req) => req.moverId));
    const assignedMovers = movers.filter((mover) => assignedMoverIds.has(mover.id));
    const assignedSelectedMovers = selectMoversByWeight(assignedMovers, moverAcceptRate, assigned);
    assignedSelectedMovers.forEach((mover) => {
      requestEstimates.push({
        estimateRequestId: request.id,
        moverId: mover.id,
        customerId,
        isAssigned: true,
        price: getPriceByMovingType(request.MovingInfo.movingType),
        status: Math.random() < 0.2 ? 'REJECTED' : 'WAITING',
        isMovingComplete: false,
        comment: getRandomResponseComment(),
        movingInfoId: request.MovingInfo.id,
        createdAt: getRandomCreatedAt(startCreatedAt, endCreatedAt),
      });
    });

    estimates.push(...deduplicateEstimates(requestEstimates));
  });
}

// 주 함수: Estimate 생성
async function generateEstimates(): Promise<void> {
  const now = new Date();

  try {
    console.log('Start generating Estimate data...');

    const estimateRequests = await prisma.estimateRequest.findMany({
      select: {
        id: true,
        customerId: true,
        createdAt: true,
        isConfirmed: true,
        MovingInfo: {
          select: {
            id: true,
            movingType: true,
            movingDate: true,
          },
        },
      },
    });

    const movers = await prisma.mover.findMany();
    const assignedEstimateRequests = await prisma.assignedEstimateRequest.findMany({
      where: {
        isRejected: false,
      }
    });

    if (estimateRequests.length === 0 || movers.length === 0) {
      throw new Error('No EstimateRequest or Mover data found in the database.');
    }

    const estimates: Estimate[] = [];

    const pastRequests = estimateRequests.filter((req) => new Date(req.MovingInfo.movingDate) <= now);
    const futureRequests = estimateRequests.filter((req) => new Date(req.MovingInfo.movingDate) > now);

    processPastRequests(pastRequests, movers, assignedEstimateRequests, estimates);
    processFutureRequests(futureRequests, movers, assignedEstimateRequests, estimates);

    const estimateFilePath = './data/estimates.json';
    fs.writeFileSync(estimateFilePath, JSON.stringify(estimates, null, 2), 'utf-8');
    console.log(`Generated ${estimates.length} estimates, saved to ${estimateFilePath}`);
  } catch (err) {
    console.error('Error generating estimates:', err);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

// 실행
generateEstimates();
