import { prisma } from '../../helper/helperDB';
import * as fs from 'fs/promises';
import path from 'path';

const BATCH_SIZE = 100; // 배치 크기
const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
const FAILED_USERS_FILE = path.join(FAILED_DATA_DIR, 'failed_users.json');
const FAILED_MOVERS_FILE = path.join(FAILED_DATA_DIR, 'failed_movers.json');
const FAILED_CUSTOMERS_FILE = path.join(FAILED_DATA_DIR, 'failed_customers.json');

/**
 * 실패 데이터를 저장하는 함수
 */
async function saveFailedData(data: any[], filePath: string) {
  try {
    await fs.mkdir(FAILED_DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`📁 실패한 데이터를 ${filePath}에 저장했습니다.`);
  } catch (error) {
    console.error(`❌ 실패한 데이터를 저장하는 중 오류 발생: ${filePath}`, error);
  }
}

/**
 * 데이터를 batch 크기 단위로 나누어 처리하는 헬퍼 함수
 */
async function insertInBatches(data: any[], modelName: string, createFn: (batch: any[]) => Promise<void>) {
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    console.log(`🛠️ ${modelName} 데이터 ${i + 1} ~ ${i + batch.length} 처리 중...`);
    try {
      await createFn(batch);
      console.log(`✅ ${modelName} 데이터 ${i + 1} ~ ${i + batch.length} 삽입 완료!`);
    } catch (error) {
      console.error(`❌ ${modelName} 데이터 처리 실패 (범위: ${i + 1} ~ ${i + batch.length}):`, error);
      await saveFailedData(batch, `${FAILED_DATA_DIR}/${modelName.toLowerCase()}_failed_batch_${i + 1}.json`);
    }
  }
}

/**
 * 전체 데이터를 배치 단위로 createMany를 사용해 삽입
 */
export async function seedDatabase() {
  try {
    console.log('🚀 데이터 시딩을 시작합니다...');

    const usersFilePath = path.join(__dirname, '../data/users.json');
    const moversFilePath = path.join(__dirname, '../data/movers.json');
    const customersFilePath = path.join(__dirname, '../data/customers.json');

    const [usersData, moversData, customersData] = await Promise.all([
      fs.readFile(usersFilePath, 'utf-8').then(JSON.parse),
      fs.readFile(moversFilePath, 'utf-8').then(JSON.parse),
      fs.readFile(customersFilePath, 'utf-8').then(JSON.parse),
    ]);

    // 유저 데이터 삽입
    console.log('🛠️ 유저 데이터 시딩 시작...');
    await insertInBatches(usersData, '유저', async (batch) => {
      await prisma.user.createMany({
        data: batch,
        skipDuplicates: true,
      });
    });

    // 고객 데이터 삽입
    console.log('🛠️ 고객 데이터 시딩 시작...');
    await insertInBatches(customersData, '고객', async (batch) => {
      await prisma.customer.createMany({
        data: batch,
        skipDuplicates: true,
      });
    });

    // 이사 업체 데이터 삽입
    console.log('🛠️ 이사 업체 데이터 시딩 시작...');
    await insertInBatches(moversData, '이사 업체', async (batch) => {
      await prisma.mover.createMany({
        data: batch,
        skipDuplicates: true,
      });
    });

    // createdAt 업데이트
    console.log('🛠️ customer의 createdAt 업데이트 중...');
    await prisma.$executeRawUnsafe(`
      UPDATE "customer"
      SET "createdAt" = (
        SELECT "createdAt" FROM "user" WHERE "user"."id" = "customer"."user_id"
      )
      WHERE EXISTS (
        SELECT 1 FROM "user" WHERE "user"."id" = "customer"."user_id"
      );
    `);
    console.log('✅ customer의 createdAt 업데이트 완료.');
    
    console.log('🛠️ mover의 createdAt 업데이트 중...');
    await prisma.$executeRawUnsafe(`
      UPDATE "mover"
      SET "createdAt" = (
        SELECT "createdAt" FROM "user" WHERE "user"."id" = "mover"."user_id"
      )
      WHERE EXISTS (
        SELECT 1 FROM "user" WHERE "user"."id" = "mover"."user_id"
      );
    `);
    console.log('✅ mover의 createdAt 업데이트 완료.');
    

    console.log('✨ 모든 데이터를 성공적으로 처리했습니다!');
  } catch (error) {
    console.error('🔥 데이터 시딩 중 오류 발생:', error);
  }
}

// 파일이 직접 실행되었는지 확인
if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      console.error('❌ 시딩 작업 중 오류 발생:', error);
    })
    .finally(async () => {
      await prisma.$disconnect();
      console.log('🔌 Prisma 클라이언트 연결이 해제되었습니다.');
    });
}

