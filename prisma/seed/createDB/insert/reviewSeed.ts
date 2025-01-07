import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

const prisma = new PrismaClient();

const BATCH_SIZE = 100; // 배치 크기
const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수
const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
const FAILED_DATA_FILE = path.join(FAILED_DATA_DIR, 'failed_reviews.json'); // 실패한 데이터 저장 파일 경로

async function seedReviews(): Promise<void> {
  const failedReviews: any[] = []; // 실패한 데이터 저장 배열

  try {
    console.log('🚀 리뷰 데이터 시딩을 시작합니다...');

    // JSON 파일 읽기
    const filePath = '../data/reviews.json';
    const fileData = await fs.readFile(filePath, 'utf-8');
    const reviews = JSON.parse(fileData);

    if (!Array.isArray(reviews)) {
      throw new Error('❌ 잘못된 데이터 형식: reviews.json은 배열이어야 합니다.');
    }

    console.log(`📄 총 ${reviews.length}개의 리뷰 데이터를 읽었습니다.`);

    // 비동기 큐 생성
    const limit = pLimit(CONCURRENCY_LIMIT);

    // 기존 데이터 ID 확인 (중복 방지)
    console.log('🔍 기존 데이터 확인 중...');
    const existingIds = await prisma.review.findMany({
      select: { id: true },
    }).then((existing) => new Set(existing.map((r) => r.id)));

    // 중복 제거된 데이터 필터링
    const filteredReviews = reviews.filter((review) => !existingIds.has(review.id));
    console.log(`✅ 처리할 리뷰: ${filteredReviews.length}개 (중복 제외됨)`);

    if (filteredReviews.length === 0) {
      console.log('✨ 중복되지 않은 데이터가 없어 작업을 종료합니다.');
      return;
    }

    // 배치 처리
    for (let i = 0; i < filteredReviews.length; i += BATCH_SIZE) {
      const batch = filteredReviews.slice(i, i + BATCH_SIZE); // 배치 추출
      const batchNumber = Math.ceil(i / BATCH_SIZE) + 1;

      console.log(`🛠️ 배치 ${batchNumber} 처리 중...`);

      // 비동기 큐로 배치 데이터 병렬 처리
      await Promise.all(
        batch.map((review, index) =>
          limit(async () => {
            try {
              await prisma.review.upsert({
                where: { id: review.id }, // 고유 ID 기준 중복 방지
                update: review, // 데이터 업데이트
                create: review, // 데이터 생성
              });
              console.log(
                `✅ [${i + index + 1}/${filteredReviews.length}] 성공적으로 처리된 리뷰: ${review.id}`
              );
            } catch (error) {
              console.error(`❌ 처리 실패: ${review.id}`, error);
              failedReviews.push(review); // 실패한 데이터 저장
            }
          })
        )
      );

      console.log(`🎉 배치 ${batchNumber} 완료!`);
    }

    console.log('✨ 모든 배치를 성공적으로 처리했습니다!');
  } catch (error) {
    console.error('🔥 리뷰 데이터 시딩 중 오류 발생:', error);
  } finally {
    // 실패한 데이터 저장
    if (failedReviews.length > 0) {
      console.log(`❌ ${failedReviews.length}개의 실패한 데이터를 ${FAILED_DATA_FILE}에 저장합니다.`);

      try {
        // 실패 데이터 디렉터리 생성
        await fs.mkdir(FAILED_DATA_DIR, { recursive: true });
        // 실패한 데이터 저장
        await fs.writeFile(FAILED_DATA_FILE, JSON.stringify(failedReviews, null, 2));
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
seedReviews();
