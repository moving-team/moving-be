import { prisma } from '../../helper/helperDB';
import * as fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

import { CONCURRENCY_LIMIT } from './seedingMain';

const BATCH_SIZE = 100; // 배치 크기
// const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수
const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
const FAILED_FILE_PATH = path.join(
  FAILED_DATA_DIR,
  'failed_assigned_requests.json'
); // 실패한 데이터 저장 파일 경로

async function saveFailedData(data: any[], filePath: string) {
  try {
    await fs.mkdir(FAILED_DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`📁 실패한 데이터를 ${filePath}에 저장했습니다.`);
  } catch (error) {
    console.error(
      `❌ 실패한 데이터를 저장하는 중 오류 발생: ${filePath}`,
      error
    );
  }
}

async function retryFailedData(filePath: string) {
  try {
    const fileExists = await fs
      .stat(filePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      console.log(
        `✨ ${filePath} 파일이 존재하지 않아 재시도할 데이터가 없습니다.`
      );
      return true; // No data to retry
    }

    const failedData = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    if (!Array.isArray(failedData) || failedData.length === 0) {
      console.log(
        `✨ ${filePath}에 유효한 데이터가 없어 재시도 작업을 건너뜁니다.`
      );
      await fs.unlink(filePath); // Delete the file
      return true; // No data to retry
    }

    console.log(`🔄 ${filePath}에 저장된 실패 데이터를 다시 시도합니다...`);

    const limit = pLimit(CONCURRENCY_LIMIT);
    const retryFailed: any[] = [];

    await Promise.all(
      failedData.map((request) =>
        limit(async () => {
          try {
            await prisma.assignedEstimateRequest.create({
              data: request,
            });
          } catch (error) {
            console.error(`❌ 재처리 실패: ${JSON.stringify(request)}`, error);
            retryFailed.push(request);
          }
        })
      )
    );

    if (retryFailed.length > 0) {
      await saveFailedData(retryFailed, filePath);
      console.log(`❌ 재시도 실패 데이터를 ${filePath}에 저장했습니다.`);
      return false; // Some data failed
    } else {
      await fs.unlink(filePath);
      console.log(
        `✅ 모든 실패 데이터를 성공적으로 처리하여 ${filePath} 파일을 삭제했습니다.`
      );
      return true; // All data succeeded
    }
  } catch (error) {
    console.error(
      `❌ 실패 데이터를 다시 처리하는 중 오류 발생: ${filePath}`,
      error
    );
    return false;
  }
}

export async function seedAssignedEstimateRequests() {
  const failedRequests: any[] = [];
  const limit = pLimit(CONCURRENCY_LIMIT);

  try {
    console.log('🚀 AssignedEstimateRequest 데이터 시딩을 시작합니다...');

    const filePath = path.join(__dirname, '../data/assignedEstimateRequest.json');
    const fileData = await fs.readFile(filePath, 'utf-8');
    const assignedRequests = JSON.parse(fileData);

    if (!Array.isArray(assignedRequests)) {
      throw new Error(
        `❌ ${filePath}의 데이터 형식이 잘못되었습니다: 배열이어야 합니다.`
      );
    }

    console.log(
      `📄 총 ${assignedRequests.length}개의 AssignedEstimateRequest 데이터를 읽었습니다.`
    );

    if (assignedRequests.length === 0) {
      console.log('✨ 삽입할 데이터가 없습니다.');
      return;
    }

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
                `✅ [${i + index + 1}/${
                  assignedRequests.length
                }] 성공 (estimateRequest_Id): ${request.estimateRequestId}`
              );
            } catch (error) {
              console.error(`❌ 삽입 실패 (estimateRequest_Id): ${request.estimateRequestId}`, error);
              failedRequests.push(request);
            }
          })
        )
      );

      console.log(`🎉 배치 ${batchNumber} 완료!`);
    }

    console.log('✨ 모든 데이터를 성공적으로 처리했습니다!');
  } catch (error) {
    console.error(
      '🔥 AssignedEstimateRequest 데이터 시딩 중 오류 발생:',
      error
    );
  } finally {
    if (failedRequests.length > 0) {
      console.log(
        `❌ ${failedRequests.length}개의 실패한 데이터를 ${FAILED_FILE_PATH}에 저장합니다.`
      );
      await saveFailedData(failedRequests, FAILED_FILE_PATH);
    } else {
      console.log(
        '✅ 모든 데이터를 성공적으로 처리하여 실패 데이터가 없습니다.'
      );
    }

    const allSuccess = await retryFailedData(FAILED_FILE_PATH);

    if (allSuccess) {
      console.log('✨ 모든 실패 데이터를 성공적으로 재처리했습니다!');
    } else {
      console.log('❌ 일부 실패 데이터가 여전히 남아 있습니다.');
    }
  }
}

// 파일 직접 실행 시
if (require.main === module) {
  seedAssignedEstimateRequests()
    .catch((error) => {
      console.error('❌ 시딩 작업 중 오류 발생:', error);
    })
    .finally(async () => {
      await prisma.$disconnect();
      console.log('🔌 Prisma 클라이언트 연결이 해제되었습니다.');
    });
}
