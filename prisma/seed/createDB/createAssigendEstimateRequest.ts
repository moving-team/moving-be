import { prisma } from '../helper/helperDB';
import * as fs from 'fs/promises';
import path from 'path';

const BATCH_SIZE = 100;

// AssignedEstimateRequest 타입 정의
type AssignedEstimateRequest = {
  estimateRequestId: number;
  moverId: number;
  isRejected: boolean;
  createdAt: Date;
};

export async function createAssignedEstimateRequest(): Promise<void> {
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
      throw new Error(
        'No EstimateRequest or Mover data found in the database.'
      );
    }

    const existingAssignments = new Set<string>(); // 중복 방지를 위한 Set
    const now = new Date(); // 현재 시간
    const totalBatches = Math.ceil(estimateRequests.length / BATCH_SIZE);

    console.log(`Processing ${totalBatches} batches...`);

    const filePath = path.join(__dirname, './data/assignedEstimateRequest.json');
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const writeStream = await fs.open(filePath, 'w');
    await writeStream.write('['); // JSON 배열 시작

    // 배치 처리
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, estimateRequests.length);
      const batch = estimateRequests.slice(start, end);

      console.log(`Processing batch ${batchIndex + 1}/${totalBatches}...`);

      const batchData: AssignedEstimateRequest[] = [];

      for (const estimateRequest of batch) {
        const movingDate = estimateRequest.MovingInfo.movingDate;
        const createdAt = estimateRequest.createdAt;

        // 생성할 AssignedEstimateRequest 개수
        const numRequests = Math.floor(Math.random() * 8) + 1;

        // 랜덤으로 Mover 선택 및 데이터 생성
        for (let i = 0; i < numRequests; i++) {
          const randomMover = movers[Math.floor(Math.random() * movers.length)];
          const assignmentKey = `${estimateRequest.id}-${randomMover.id}`;

          // 중복 확인
          if (existingAssignments.has(assignmentKey)) {
            continue;
          }

          // Random createdAt between EstimateRequest createdAt and movingDate - 1 day
          const randomCreatedAt = new Date(
            createdAt.getTime() +
              Math.random() *
                (movingDate.getTime() - createdAt.getTime() - 86400000)
          );

          // 현재 시간을 초과하면 스킵
          if (randomCreatedAt > now) {
            continue;
          }

          batchData.push({
            estimateRequestId: estimateRequest.id,
            moverId: randomMover.id,
            isRejected: Math.random() < 0.25, // 25% 확률로 true
            createdAt: randomCreatedAt,
          });

          // 중복 방지를 위해 추가
          existingAssignments.add(assignmentKey);
        }
      }

      // JSON으로 변환하여 스트림에 저장
      const jsonBatch = JSON.stringify(batchData, null, 2).slice(1, -1); // JSON 포맷 유지
      await writeStream.write(`${batchIndex === 0 ? '' : ','}${jsonBatch}`);
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

    await prettifyJsonFile(filePath);

    console.log(`AssignedEstimateRequest data saved to ${filePath}`);
  } catch (error) {
    console.error(
      'Error during AssignedEstimateRequest data generation:',
      error
    );
  }
}

if (require.main === module) {
  createAssignedEstimateRequest()
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
