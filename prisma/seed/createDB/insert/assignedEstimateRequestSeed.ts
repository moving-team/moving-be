import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

const prisma = new PrismaClient();

const BATCH_SIZE = 100; // 배치 크기
const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수
const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
const FAILED_FILE_PATH = path.join(FAILED_DATA_DIR, 'failed_assigned_requests.json'); // 실패한 데이터 저장 파일 경로

async function seedAssignedEstimateRequest() {
  const failedRequests: any[] = []; // 실패한 데이터 저장 배열

  try {
    console.log('🚀 AssignedEstimateRequest 데이터 시딩을 시작합니다...');

    // JSON 파일 경로
    const filePath = '../data/assignedEstimateRequest.json';

    // JSON 데이터 읽기
    const fileData = await fs.readFile(filePath, 'utf-8');
    const assignedRequests = JSON.parse(fileData);

    // 데이터 타입 검증
    if (!Array.isArray(assignedRequests)) {
      throw new Error(`❌ ${filePath}의 데이터 형식이 잘못되었습니다: 배열이어야 합니다.`);
    }

    console.log(`📄 총 ${assignedRequests.length}개의 AssignedEstimateRequest 데이터를 읽었습니다.`);

    if (assignedRequests.length === 0) {
      console.log('✨ 삽입할 데이터가 없습니다.');
      return;
    }

    // 비동기 큐 생성
    const limit = pLimit(CONCURRENCY_LIMIT);

    // 배치 처리
    for (let i = 0; i < assignedRequests.length; i += BATCH_SIZE) {
      const batch = assignedRequests.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.ceil(i / BATCH_SIZE) + 1;

      console.log(`🛠️ 배치 ${batchNumber} 처리 중...`);

      await Promise.all(
        batch.map((request, index) =>
          limit(async () => {
            try {
              await prisma.assignedEstimateRequest.create({
                data: request,
              });
              console.log(
                `✅ [${i + index + 1}/${assignedRequests.length}] 성공적으로 삽입된 AssignedEstimateRequest: ${JSON.stringify(
                  request
                )}`
              );
            } catch (error) {
              console.error(`❌ 삽입 실패: ${JSON.stringify(request)}`, error);
              failedRequests.push(request); // 실패한 데이터 저장
            }
          })
        )
      );

      console.log(`🎉 배치 ${batchNumber} 완료!`);
    }

    console.log('✨ 모든 데이터를 성공적으로 처리했습니다!');
  } catch (error) {
    console.error('🔥 AssignedEstimateRequest 데이터 시딩 중 오류 발생:', error);
  } finally {
    // 실패한 데이터 저장
    if (failedRequests.length > 0) {
      console.log(`❌ ${failedRequests.length}개의 실패한 데이터를 ${FAILED_FILE_PATH}에 저장합니다.`);

      try {
        await fs.mkdir(FAILED_DATA_DIR, { recursive: true });
        await fs.writeFile(FAILED_FILE_PATH, JSON.stringify(failedRequests, null, 2));
        console.log(`📁 실패한 데이터를 ${FAILED_FILE_PATH}에 저장했습니다.`);
      } catch (fsError) {
        console.error('❌ 실패한 데이터를 저장하는 중 오류 발생:', fsError);
      }
    }

    await prisma.$disconnect();
    console.log('🔌 Prisma 클라이언트 연결이 해제되었습니다.');
  }
}

// 실행
seedAssignedEstimateRequest();
