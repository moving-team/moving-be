import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

const prisma = new PrismaClient();

const BATCH_SIZE = 100; // 배치 크기
const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수
const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
const FAILED_USERS_FILE = path.join(FAILED_DATA_DIR, 'failed_users.json');
const FAILED_MOVERS_FILE = path.join(FAILED_DATA_DIR, 'failed_movers.json');
const FAILED_CUSTOMERS_FILE = path.join(FAILED_DATA_DIR, 'failed_customers.json');

async function seedDataBatch<T>(
  data: T[],
  modelName: string,
  createFn: (item: T) => Promise<void>,
  failedDataFile: string
) {
  const failedData: T[] = [];
  const limit = pLimit(CONCURRENCY_LIMIT);

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.ceil(i / BATCH_SIZE) + 1;

    console.log(`🛠️ ${modelName} 배치 ${batchNumber} 처리 중...`);

    await Promise.all(
      batch.map((item, index) =>
        limit(async () => {
          try {
            await createFn(item);
            console.log(`✅ [${i + index + 1}/${data.length}] ${modelName} 성공: ${JSON.stringify(item)}`);
          } catch (error) {
            console.error(`❌ ${modelName} 실패: ${JSON.stringify(item)}`, error);
            failedData.push(item);
          }
        })
      )
    );

    console.log(`🎉 ${modelName} 배치 ${batchNumber} 완료!`);
  }

  if (failedData.length > 0) {
    await saveFailedData(failedData, failedDataFile);
    console.log(`❌ 실패한 ${modelName} 데이터를 ${failedDataFile}에 저장했습니다.`);
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

async function seedDatabase() {
  try {
    console.log('🚀 데이터 시딩을 시작합니다...');

    // JSON 파일 경로
    const usersFilePath = '../data/users.json';
    const moversFilePath = '../data/movers.json';
    const customersFilePath = '../data/customers.json';

    // JSON 데이터 읽기
    const [usersData, moversData, customersData] = await Promise.all([
      fs.readFile(usersFilePath, 'utf-8').then(JSON.parse),
      fs.readFile(moversFilePath, 'utf-8').then(JSON.parse),
      fs.readFile(customersFilePath, 'utf-8').then(JSON.parse),
    ]);

    // 데이터 타입 검증
    if (!Array.isArray(usersData)) throw new Error(`❌ ${usersFilePath}의 데이터 형식이 잘못되었습니다.`);
    if (!Array.isArray(moversData)) throw new Error(`❌ ${moversFilePath}의 데이터 형식이 잘못되었습니다.`);
    if (!Array.isArray(customersData)) throw new Error(`❌ ${customersFilePath}의 데이터 형식이 잘못되었습니다.`);

    console.log(`📄 총 ${usersData.length}명의 유저 데이터를 읽었습니다.`);
    console.log(`📄 총 ${moversData.length}명의 이사 업체 데이터를 읽었습니다.`);
    console.log(`📄 총 ${customersData.length}명의 고객 데이터를 읽었습니다.`);

    // 유저 데이터 삽입
    await seedDataBatch(
      usersData,
      '유저',
      async (user) => {
        await prisma.user.create({ data: user });
      },
      FAILED_USERS_FILE
    );

    // 이사 업체 데이터 삽입
    await seedDataBatch(
      moversData,
      '이사 업체',
      async (mover) => {
        await prisma.mover.create({ data: mover });
      },
      FAILED_MOVERS_FILE
    );

    // 고객 데이터 삽입
    await seedDataBatch(
      customersData,
      '고객',
      async (customer) => {
        await prisma.customer.create({ data: customer });
      },
      FAILED_CUSTOMERS_FILE
    );

    console.log('✨ 모든 데이터를 성공적으로 처리했습니다!');
  } catch (error) {
    console.error('🔥 데이터 시딩 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Prisma 클라이언트 연결이 해제되었습니다.');
  }
}

// 실행
seedDatabase();
