import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

const prisma = new PrismaClient();

const BATCH_SIZE = 100; // 배치 크기
const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수
const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
const FAILED_DATA_FILE = path.join(FAILED_DATA_DIR, 'failed_favorites.json'); // 실패한 데이터 저장 파일 경로

async function insertFavoritesFromJson() {
  const failedFavorites: any[] = []; // 실패한 데이터 저장 배열

  try {
    console.log('🚀 Favorite 데이터 삽입을 시작합니다...');

    // JSON 파일 읽기
    const filePath = '../data/favorite.json';
    const fileData = await fs.readFile(filePath, 'utf-8');
    const favoriteData = JSON.parse(fileData);

    if (!Array.isArray(favoriteData) || favoriteData.length === 0) {
      console.log('⚠️ JSON 파일에 유효한 데이터가 없습니다.');
      return;
    }

    console.log(`📄 총 ${favoriteData.length}개의 Favorite 데이터를 읽었습니다.`);

    // 기존 데이터 확인 (중복 방지)
    console.log('🔍 기존 데이터 확인 중...');
    const existingRecords = await prisma.favorite.findMany({
      select: { customerId: true, moverId: true },
    });
    const existingPairs = new Set(
      existingRecords.map((record) => `${record.customerId}-${record.moverId}`)
    );

    // 중복 제거된 데이터 필터링
    const filteredFavorites = favoriteData.filter(
      (favorite: any) =>
        !existingPairs.has(`${favorite.customerId}-${favorite.moverId}`)
    );

    console.log(`✅ 처리할 Favorite 데이터: ${filteredFavorites.length}개 (중복 제외됨)`);

    if (filteredFavorites.length === 0) {
      console.log('✨ 중복되지 않은 데이터가 없어 작업을 종료합니다.');
      return;
    }

    // 비동기 큐 생성
    const limit = pLimit(CONCURRENCY_LIMIT);

    // 배치 처리
    for (let i = 0; i < filteredFavorites.length; i += BATCH_SIZE) {
      const batch = filteredFavorites.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.ceil(i / BATCH_SIZE) + 1;

      console.log(`🛠️ 배치 ${batchNumber} 처리 중...`);

      // 비동기 큐로 배치 데이터 병렬 처리
      await Promise.all(
        batch.map((favorite: any, index) =>
          limit(async () => {
            try {
              await prisma.favorite.create({
                data: {
                  customerId: favorite.customerId,
                  moverId: favorite.moverId,
                },
              });
              console.log(
                `✅ [${i + index + 1}/${filteredFavorites.length}] 성공적으로 삽입된 Favorite: ${favorite.customerId}-${favorite.moverId}`
              );
            } catch (error) {
              console.error(`❌ 삽입 실패: ${favorite.customerId}-${favorite.moverId}`, error);
              failedFavorites.push(favorite); // 실패한 데이터 저장
            }
          })
        )
      );

      console.log(`🎉 배치 ${batchNumber} 완료!`);
    }

    console.log('✨ 모든 Favorite 데이터를 성공적으로 처리했습니다!');
  } catch (error) {
    console.error('🔥 Favorite 데이터 삽입 중 오류 발생:', error);
  } finally {
    // 실패한 데이터 저장
    if (failedFavorites.length > 0) {
      console.log(`❌ ${failedFavorites.length}개의 실패한 데이터를 ${FAILED_DATA_FILE}에 저장합니다.`);

      try {
        // 실패 데이터 디렉터리 생성
        await fs.mkdir(FAILED_DATA_DIR, { recursive: true });
        // 실패한 데이터 저장
        await fs.writeFile(FAILED_DATA_FILE, JSON.stringify(failedFavorites, null, 2));
        console.log(`📁 실패한 데이터를 ${FAILED_DATA_FILE}에 저장했습니다.`);
      } catch (fsError) {
        console.error('❌ 실패한 데이터를 저장하는 중 오류 발생:', fsError);
      }
    }

    await prisma.$disconnect();
    console.log('🔌 Prisma 클라이언트 연결이 해제되었습니다.');
  }
}

insertFavoritesFromJson();
