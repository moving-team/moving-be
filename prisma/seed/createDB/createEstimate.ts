import { prisma } from '../helper/helperDB';
import { getRandomResponseComment } from '../generate/getResComment';
import { getPriceByMovingType } from '../generate/getWeightPrice';
import { getMoverAcceptRate } from '../generate/setMoverWeight';
import * as fs from 'fs/promises';
import path from 'path';

const BATCH_SIZE = 100;

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

// Estimate 요청 처리 함수
async function processEstimateRequestsBatch(
  requests: any[],
  movers: any[],
  assignedEstimateRequests: any[],
  isFuture: boolean
): Promise<Estimate[]> {
  const estimates: Estimate[] = [];
  const moverAcceptRate = getMoverAcceptRate(movers);

  requests.forEach((request) => {
    const { assigned, unassigned } = determineAssignedCounts();
    const customerId = request.customerId;
    const movingDate = new Date(request.MovingInfo.movingDate);
    const startCreatedAt = new Date(request.createdAt);
    const endCreatedAt = isFuture ? movingDate : new Date(Math.min(new Date().getTime(), movingDate.getTime() - 86400000));

    const requestEstimates: Estimate[] = [];

    // Unassigned Estimate 생성
    const unassignedSelectedMovers = selectMoversByWeight(movers, moverAcceptRate, unassigned);
    unassignedSelectedMovers.forEach((mover) => {
      requestEstimates.push({
        estimateRequestId: request.id,
        moverId: mover.id,
        customerId,
        isAssigned: false,
        price: getPriceByMovingType(request.MovingInfo.movingType),
        status: isFuture ? (Math.random() < 0.2 ? 'REJECTED' : 'WAITING') : 'REJECTED',
        isMovingComplete: false,
        comment: getRandomResponseComment(),
        movingInfoId: request.MovingInfo.id,
        createdAt: getRandomCreatedAt(startCreatedAt, endCreatedAt),
      });
    });

    // Assigned Estimate 생성
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
        status: isFuture ? (Math.random() < 0.2 ? 'REJECTED' : 'WAITING') : 'REJECTED',
        isMovingComplete: false,
        comment: getRandomResponseComment(),
        movingInfoId: request.MovingInfo.id,
        createdAt: getRandomCreatedAt(startCreatedAt, endCreatedAt),
      });
    });

    const uniqueEstimates = deduplicateEstimates(requestEstimates);

    // isConfirmed 처리
    if (!isFuture && request.isConfirmed && uniqueEstimates.length > 0) {
      const randomIndex = Math.floor(Math.random() * uniqueEstimates.length);
      uniqueEstimates[randomIndex].status = 'ACCEPTED';
      uniqueEstimates[randomIndex].isMovingComplete = true;
    }

    estimates.push(...uniqueEstimates);
  });

  return estimates;
}

// 주 함수: Estimate 생성
export async function createEstimate(): Promise<void> {
  const now = new Date();
  const estimateFilePath = path.join(__dirname, './data/estimates.json');

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
      where: { isRejected: false },
    });

    if (estimateRequests.length === 0 || movers.length === 0) {
      throw new Error('No EstimateRequest or Mover data found in the database.');
    }

    const pastRequests = estimateRequests.filter((req) => new Date(req.MovingInfo.movingDate) <= now);
    const futureRequests = estimateRequests.filter((req) => new Date(req.MovingInfo.movingDate) > now);

    await fs.mkdir(path.dirname(estimateFilePath), { recursive: true }); // 폴더 생성
    const writeStream = await fs.open(estimateFilePath, 'w'); // JSON 스트림 열기
    await writeStream.write('['); // JSON 배열 시작

    // Past requests 처리
    for (let i = 0; i < Math.ceil(pastRequests.length / BATCH_SIZE); i++) {
      const batch = pastRequests.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      const estimates = await processEstimateRequestsBatch(batch, movers, assignedEstimateRequests, false);
      const jsonBatch = JSON.stringify(estimates, null, 2).slice(1, -1);
      await writeStream.write(`${i === 0 ? '' : ','}${jsonBatch}`);
      console.log(`Processed past batch ${i + 1}/${Math.ceil(pastRequests.length / BATCH_SIZE)}`);
    }

    // Future requests 처리
    for (let i = 0; i < Math.ceil(futureRequests.length / BATCH_SIZE); i++) {
      const batch = futureRequests.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      const estimates = await processEstimateRequestsBatch(batch, movers, assignedEstimateRequests, true);
      const jsonBatch = JSON.stringify(estimates, null, 2).slice(1, -1);
      await writeStream.write(`${pastRequests.length === 0 && i === 0 ? '' : ','}${jsonBatch}`);
      console.log(`Processed future batch ${i + 1}/${Math.ceil(futureRequests.length / BATCH_SIZE)}`);
    }

    await writeStream.write(']'); // JSON 배열 종료
    await writeStream.close(); // 스트림 닫기

    async function prettifyJsonFile(filePath: string): Promise<void> {
      try {
        console.log('Prettifying JSON file...');
        const rawData = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(rawData); // JSON 파싱
        const prettyData = JSON.stringify(jsonData, null, 2); // Pretty 변환
        await fs.writeFile(filePath, prettyData, 'utf-8'); // 파일 다시 저장
        console.log('JSON file prettified successfully.');
      } catch (error) {
        console.error('Error prettifying JSON file:', error);
      }
    }

    await prettifyJsonFile(estimateFilePath);

    console.log(`Generated estimates saved to ${estimateFilePath}`);
  } catch (err) {
    console.error('Error generating estimates:', err);
  } 
}

// 실행
if (require.main === module) {
  createEstimate()
    .catch((error) => {
      console.error('❌ 오류 발생:', error);
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