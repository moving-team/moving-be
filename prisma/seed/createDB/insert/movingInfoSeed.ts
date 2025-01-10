import { prisma } from '../../helper/helperDB';
import * as fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

import { CONCURRENCY_LIMIT } from './seedingMain';

const BATCH_SIZE = 100; // 배치 크기
// const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수
const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
const FAILED_DATA_FILE = path.join(FAILED_DATA_DIR, 'failed_moving_info.json'); // 실패한 데이터 저장 파일 경로

async function retryFailedData<T>(
  filePath: string,
  modelName: string,
  createFn: (item: T) => Promise<void>
) {
  try {
    const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);
    if (!fileExists) {
      console.log(`✨ ${filePath} 파일이 존재하지 않아 재시도할 데이터가 없습니다.`);
      return;
    }

    console.log(`🔄 ${filePath}에 저장된 실패 데이터를 다시 시도합니다...`);
    const failedData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    if (!Array.isArray(failedData) || failedData.length === 0) {
      console.log(`✨ ${filePath}에 유효한 데이터가 없어 작업을 건너뜁니다.`);
      await fs.unlink(filePath); // 유효하지 않은 파일 삭제
      return;
    }

    const failedRetries: T[] = [];
    const limit = pLimit(CONCURRENCY_LIMIT);

    await Promise.all(
      failedData.map((item) =>
        limit(async () => {
          try {
            await createFn(item);
          } catch (error) {
            failedRetries.push(item); // 재시도 실패한 데이터 저장
          }
        })
      )
    );

    if (failedRetries.length === 0) {
      console.log(`✨ ${filePath} 내 모든 실패 데이터를 성공적으로 처리했습니다.`);
      await fs.unlink(filePath); // 성공적으로 처리되면 파일 삭제
      console.log(`🗑️ ${filePath} 파일을 삭제했습니다.`);
    } else {
      await saveFailedData(failedRetries, filePath);
      console.log(`❌ 여전히 실패한 데이터를 ${filePath}에 저장했습니다.`);
    }
  } catch (error) {
    console.error(`❌ ${filePath} 재시도 작업 중 오류 발생:`, error);
  }
}

async function saveFailedData(data: any[], filePath: string) {
  try {
    await fs.mkdir(FAILED_DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`❌ 실패한 데이터를 저장하는 중 오류 발생: ${filePath}`, error);
  }
}

export async function seedMovingInfo() {
  const failedMovingInfo: any[] = []; // 실패한 데이터 저장 배열

  try {
    console.log('🚀 MovingInfo 데이터 시딩을 시작합니다...');

    // JSON 파일 경로
    const movingInfoFilePath = path.join(__dirname, '../data/movingInfo.json');

    // JSON 데이터 읽기
    const fileData = await fs.readFile(movingInfoFilePath, 'utf-8');
    const movingInfoData: any = JSON.parse(fileData);

    if (!Array.isArray(movingInfoData)) {
      throw new Error(`❌ ${movingInfoFilePath}의 데이터 형식이 잘못되었습니다: 배열이어야 합니다.`);
    }

    console.log(`📄 총 ${movingInfoData.length}개의 MovingInfo 데이터를 읽었습니다.`);

    const limit = pLimit(CONCURRENCY_LIMIT);

    for (let i = 0; i < movingInfoData.length; i += BATCH_SIZE) {
      const batch = movingInfoData.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.ceil(i / BATCH_SIZE) + 1;

      console.log(`🛠️ 배치 ${batchNumber} 처리 중...`);

      await Promise.all(
        batch.map((info, index) =>
          limit(async () => {
            try {
              await prisma.movingInfo.create({
                data: {
                  movingType: info.movingType,
                  movingDate: new Date(info.movingDate),
                  departure: info.departure,
                  arrival: info.arrival,
                  createdAt: new Date(info.createdAt),
                },
              });
              console.log(`✅ [${i + index + 1}/${movingInfoData.length}] 성공적으로 처리되었습니다.`);
            } catch (error) {
              console.error(`❌ 처리 실패: ${info.movingType}`, error);
              failedMovingInfo.push(info);
            }
          })
        )
      );

      console.log(`🎉 배치 ${batchNumber} 완료!`);
    }

    console.log('✨ 모든 MovingInfo 데이터를 성공적으로 처리했습니다!');
  } catch (error) {
    console.error('🔥 데이터 시딩 중 오류 발생:', error);
  } finally {
    if (failedMovingInfo.length > 0) {
      console.log(`❌ ${failedMovingInfo.length}개의 실패한 데이터를 ${FAILED_DATA_FILE}에 저장합니다.`);
      await saveFailedData(failedMovingInfo, FAILED_DATA_FILE);
    } else {
      console.log('✨ 모든 데이터가 성공적으로 처리되어 실패 데이터가 없습니다.');
    }

    await retryFailedData(FAILED_DATA_FILE, 'MovingInfo', async (info: any) => {
      await prisma.movingInfo.create({
        data: {
          movingType: info.movingType,
          movingDate: new Date(info.movingDate),
          departure: info.departure,
          arrival: info.arrival,
          createdAt: new Date(info.createdAt),
        },
      });
    });
  }
}

// 파일이 직접 실행되었는지 확인
if (require.main === module) {
  seedMovingInfo()
    .catch((error) => {
      console.error('❌ 업데이트 작업 중 오류 발생:', error);
    })
    .finally(async () => {
      await prisma.$disconnect();
      console.log('🔌 Prisma 클라이언트 연결이 해제되었습니다.');
    });
}
