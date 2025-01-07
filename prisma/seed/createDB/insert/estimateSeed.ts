import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import pLimit from 'p-limit';

const prisma = new PrismaClient();

const BATCH_SIZE = 100; // 배치 크기
const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수
const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
const FAILED_DATA_FILE = path.join(FAILED_DATA_DIR, 'failed_estimates.json'); // 실패한 데이터 저장 파일 경로

async function seedEstimates() {
  const failedEstimates: any[] = []; // 실패한 데이터 저장 배열

  try {
    console.log('🚀 Estimate 데이터 시딩을 시작합니다...');

    // JSON 파일 읽기
    const filePath = '../data/estimates.json';
    const fileData = await fs.readFile(filePath, 'utf-8');
    const estimates = JSON.parse(fileData);

    // 데이터 타입 검증
    if (!Array.isArray(estimates) || estimates.length === 0) {
      console.log('⚠️ JSON 파일에 유효한 데이터가 없습니다.');
      return;
    }

    console.log(`📄 총 ${estimates.length}개의 Estimate 데이터를 읽었습니다.`);

    // 기존 데이터 확인 (중복 방지)
    console.log('🔍 기존 Estimate 데이터를 확인 중...');
    const existingRecords = await prisma.estimate.findMany({
      select: { id: true },
    });
    const existingIds = new Set(existingRecords.map((record) => record.id));

    // 중복 제거된 데이터 필터링
    const filteredEstimates = estimates.filter(
      (estimate: any) => !existingIds.has(estimate.id)
    );

    console.log(`✅ 처리할 Estimate 데이터: ${filteredEstimates.length}개 (중복 제외됨)`);

    if (filteredEstimates.length === 0) {
      console.log('✨ 중복되지 않은 데이터가 없어 작업을 종료합니다.');
      return;
    }

    // 비동기 큐 생성
    const limit = pLimit(CONCURRENCY_LIMIT);

    // 배치 처리
    for (let i = 0; i < filteredEstimates.length; i += BATCH_SIZE) {
      const batch = filteredEstimates.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.ceil(i / BATCH_SIZE) + 1;

      console.log(`🛠️ 배치 ${batchNumber} 처리 중...`);

      // 비동기 큐로 배치 데이터 병렬 처리
      await Promise.all(
        batch.map((estimate: any, index) =>
          limit(async () => {
            try {
              await prisma.estimate.create({
                data: estimate,
              });
              console.log(
                `✅ [${i + index + 1}/${filteredEstimates.length}] 성공적으로 삽입된 Estimate: ${estimate.id}`
              );
            } catch (error) {
              console.error(`❌ 삽입 실패: ${estimate.id}`, error);
              failedEstimates.push(estimate); // 실패한 데이터 저장
            }
          })
        )
      );

      console.log(`🎉 배치 ${batchNumber} 완료!`);
    }

    console.log('✨ 모든 Estimate 데이터를 성공적으로 처리했습니다!');
  } catch (error) {
    console.error('🔥 Estimate 데이터 시딩 중 오류 발생:', error);
  } finally {
    // 실패한 데이터 저장
    if (failedEstimates.length > 0) {
      console.log(`❌ ${failedEstimates.length}개의 실패한 데이터를 ${FAILED_DATA_FILE}에 저장합니다.`);

      try {
        // 실패한 데이터 디렉터리 생성
        await fs.mkdir(FAILED_DATA_DIR, { recursive: true });
        // 실패한 데이터 저장
        await fs.writeFile(FAILED_DATA_FILE, JSON.stringify(failedEstimates, null, 2));
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
seedEstimates();
