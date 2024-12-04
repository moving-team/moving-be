import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

// AssignedEstimateRequest 타입 정의
type AssignedEstimateRequest = {
  estimateRequestId: number;
  moverId: number;
  isRejected: boolean;
  createdAt: Date;
};

async function generateAssignedEstimateRequests(): Promise<void> {
  try {
    console.log('Start generating AssignedEstimateRequest data...');

    // 모든 EstimateRequest 가져오기
    const estimateRequests = await prisma.estimateRequest.findMany({
      include: {
        MovingInfo: true, // MovingInfo 포함
      },
    });

    // 모든 Mover 가져오기
    const movers = await prisma.mover.findMany();

    if (estimateRequests.length === 0 || movers.length === 0) {
      throw new Error('No EstimateRequest or Mover data found in the database.');
    }

    const assignedEstimateRequests: AssignedEstimateRequest[] = []; // 타입 명시
    const existingAssignments = new Set<string>(); // 중복 방지를 위한 Set
    const now = new Date(); // 현재 시간

    // 각 EstimateRequest에 대해 처리
    for (const estimateRequest of estimateRequests) {
      // MovingDate와 CreatedAt 파싱
      const movingDate = new Date(
        estimateRequest.MovingInfo.movingDate.replace(/\./g, '-').trim()
      );
      const createdAt = new Date(estimateRequest.createdAt);

      // 생성할 AssignedEstimateRequest 개수
      const numRequests = Math.floor(Math.random() * 15) + 1;

      // 랜덤으로 Mover 선택 및 데이터 생성
      for (let i = 0; i < numRequests; i++) {
        const randomMover = movers[Math.floor(Math.random() * movers.length)];
        const assignmentKey = `${estimateRequest.id}-${randomMover.id}`;

        // 중복 확인
        if (existingAssignments.has(assignmentKey)) {
          continue; // 이미 존재하는 조합은 건너뜀
        }

        // Random createdAt between EstimateRequest createdAt and movingDate - 1 day
        const randomCreatedAt = new Date(
          createdAt.getTime() +
            Math.random() * (movingDate.getTime() - createdAt.getTime() - 86400000)
        );

        // 현재 시간을 초과하면 스킵
        if (randomCreatedAt > now) {
          continue;
        }

        assignedEstimateRequests.push({
          estimateRequestId: estimateRequest.id,
          moverId: randomMover.id,
          isRejected: Math.random() < 0.25, // 25% 확률로 true
          createdAt: randomCreatedAt,
        });

        // 중복 방지를 위해 추가
        existingAssignments.add(assignmentKey);
      }
    }

    // JSON 파일로 저장
    const filePath = './data/assignedEstimateRequest.json';
    fs.writeFileSync(
      filePath,
      JSON.stringify(assignedEstimateRequests, null, 2),
      'utf-8'
    );

    console.log(
      `${assignedEstimateRequests.length}개의 AssignedEstimateRequest 데이터가 생성되었습니다.`
    );
    console.log(`데이터가 ${filePath}에 저장되었습니다.`);
  } catch (error) {
    console.error('Error during AssignedEstimateRequest data generation:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

generateAssignedEstimateRequests();
