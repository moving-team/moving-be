import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

const prisma = new PrismaClient();

const BATCH_SIZE = 50; // 배치 크기
const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수
const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
const FAILED_FILE_PATH = path.join(FAILED_DATA_DIR, 'failed_mover_updates.json'); // 실패한 데이터 저장 파일 경로

async function updateMoverConfirmationCount() {
  const failedUpdates: any[] = []; // 실패한 데이터 저장 배열
  const limit = pLimit(CONCURRENCY_LIMIT); // 비동기 큐 생성

  try {
    console.log('🚀 Mover 확인 카운트 업데이트를 시작합니다...');

    // Step 1: Get the count of ACCEPTED estimates grouped by moverId
    const confirmationCounts = await prisma.estimate.groupBy({
      by: ['moverId'],
      _count: {
        status: true,
      },
      where: {
        status: 'ACCEPTED',
      },
    });

    console.log(`📄 총 ${confirmationCounts.length}개의 Mover 확인 카운트 데이터를 가져왔습니다.`);

    if (confirmationCounts.length === 0) {
      console.log('✨ 업데이트할 데이터가 없습니다.');
      return;
    }

    // Step 2: Batch process updates
    for (let i = 0; i < confirmationCounts.length; i += BATCH_SIZE) {
      const batch = confirmationCounts.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.ceil(i / BATCH_SIZE) + 1;

      console.log(`🛠️ 배치 ${batchNumber} 처리 중...`);

      await Promise.all(
        batch.map(({ moverId, _count }, index) =>
          limit(async () => {
            try {
              await prisma.mover.update({
                where: { id: moverId },
                data: { confirmationCount: _count.status },
              });
              console.log(
                `✅ [${i + index + 1}/${confirmationCounts.length}] Mover 업데이트 성공: moverId=${moverId}, confirmationCount=${_count.status}`
              );
            } catch (error) {
              console.error(
                `❌ Mover 업데이트 실패: moverId=${moverId}, confirmationCount=${_count.status}`,
                error
              );
              failedUpdates.push({ moverId, confirmationCount: _count.status });
            }
          })
        )
      );

      console.log(`🎉 배치 ${batchNumber} 완료!`);
    }

    console.log('✨ 모든 Mover 확인 카운트 업데이트를 성공적으로 처리했습니다!');
  } catch (error) {
    console.error('🔥 Mover 확인 카운트 업데이트 중 오류 발생:', error);
  } finally {
    // Save failed updates to a file
    if (failedUpdates.length > 0) {
      console.log(`❌ ${failedUpdates.length}개의 실패한 데이터를 ${FAILED_FILE_PATH}에 저장합니다.`);

      try {
        await fs.mkdir(FAILED_DATA_DIR, { recursive: true });
        await fs.writeFile(FAILED_FILE_PATH, JSON.stringify(failedUpdates, null, 2));
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
updateMoverConfirmationCount();
