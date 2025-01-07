import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

const prisma = new PrismaClient();

const BATCH_SIZE = 100; // 배치 크기
const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수
const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
const FAILED_DATA_FILE = path.join(FAILED_DATA_DIR, 'failed_moving_info.json'); // 실패한 데이터 저장 파일 경로

async function seedMovingInfo() {
  const failedMovingInfo: any[] = []; // 실패한 데이터 저장 배열

  try {
    console.log('🚀 MovingInfo 데이터 시딩을 시작합니다...');

    // JSON 파일 경로
    const movingInfoFilePath = '../data/movingInfo.json';

    // JSON 데이터 읽기
    const fileData = await fs.readFile(movingInfoFilePath, 'utf-8');
    const movingInfoData = JSON.parse(fileData);

    // 데이터 검증
    if (!Array.isArray(movingInfoData)) {
      throw new Error(`❌ ${movingInfoFilePath}의 데이터 형식이 잘못되었습니다: 배열이어야 합니다.`);
    }

    console.log(`📄 총 ${movingInfoData.length}개의 MovingInfo 데이터를 읽었습니다.`);

    // 기존 데이터 확인 (중복 방지)
    console.log('🔍 기존 MovingInfo 데이터를 확인 중...');
    const existingRecords = await prisma.movingInfo.findMany({
      select: { id: true },
    });
    const existingIds = new Set(existingRecords.map((record) => record.id));

    // 중복 제거된 데이터 필터링
    const filteredData = movingInfoData.filter(
      (info) => !existingIds.has(info.id)
    );

    console.log(`✅ 처리할 MovingInfo 데이터: ${filteredData.length}개 (중복 제외됨)`);

    if (filteredData.length === 0) {
      console.log('✨ 중복되지 않은 데이터가 없어 작업을 종료합니다.');
      return;
    }

    // 비동기 큐 생성
    const limit = pLimit(CONCURRENCY_LIMIT);

    // 배치 처리
    for (let i = 0; i < filteredData.length; i += BATCH_SIZE) {
      const batch = filteredData.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.ceil(i / BATCH_SIZE) + 1;

      console.log(`🛠️ 배치 ${batchNumber} 처리 중...`);

      // 비동기 큐로 각 배치 데이터 병렬 처리
      await Promise.all(
        batch.map((info, index) =>
          limit(async () => {
            try {
              await prisma.movingInfo.upsert({
                where: { id: info.id },
                update: {
                  movingType: info.movingType,
                  movingDate: info.movingDate,
                  departure: info.departure,
                  arrival: info.arrival,
                  createdAt: new Date(info.createdAt),
                },
                create: {
                  id: info.id,
                  movingType: info.movingType,
                  movingDate: info.movingDate,
                  departure: info.departure,
                  arrival: info.arrival,
                  createdAt: new Date(info.createdAt),
                },
              });
              console.log(
                `✅ [${i + index + 1}/${filteredData.length}] 성공적으로 처리된 MovingInfo: ${info.id}`
              );
            } catch (error) {
              console.error(`❌ 처리 실패: ${info.id}`, error);
              failedMovingInfo.push(info); // 실패한 데이터 저장
            }
          })
        )
      );

      console.log(`🎉 배치 ${batchNumber} 완료!`);
    }

    console.log('✨ 모든 MovingInfo 데이터를 성공적으로 처리했습니다!');
  } catch (error) {
    if (error instanceof Error) {
      console.error('🔥 데이터 시딩 중 오류 발생:', error.message);
      console.error('📋 스택 트레이스:', error.stack);
    } else {
      console.error('🚨 알 수 없는 오류 발생:', error);
    }
  } finally {
    // 실패한 데이터 저장
    if (failedMovingInfo.length > 0) {
      console.log(`❌ ${failedMovingInfo.length}개의 실패한 데이터를 ${FAILED_DATA_FILE}에 저장합니다.`);

      try {
        // 실패 데이터 디렉터리 생성
        await fs.mkdir(FAILED_DATA_DIR, { recursive: true });
        // 실패한 데이터 저장
        await fs.writeFile(FAILED_DATA_FILE, JSON.stringify(failedMovingInfo, null, 2));
        console.log(`📁 실패한 데이터를 ${FAILED_DATA_FILE}에 저장했습니다.`);
      } catch (fsError) {
        console.error('❌ 실패한 데이터를 저장하는 중 오류 발생:', fsError);
      }
    }

    await prisma.$disconnect();
    console.log('🔌 Prisma 클라이언트 연결이 해제되었습니다.');
  }
}

// 실행
seedMovingInfo();
