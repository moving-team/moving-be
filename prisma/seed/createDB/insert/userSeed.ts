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



// import { prisma } from '../../helper/helperDB';
// import * as fs from 'fs/promises';
// import path from 'path';
// import pLimit from 'p-limit';

// const BATCH_SIZE = 100; // 배치 크기
// const CONCURRENCY_LIMIT = 10; // 비동기 큐 최대 동시 실행 작업 수
// const FAILED_DATA_DIR = path.join(__dirname, '../faildata'); // 실패한 데이터 저장 디렉터리
// const FAILED_USERS_FILE = path.join(FAILED_DATA_DIR, 'failed_users.json');
// const FAILED_MOVERS_FILE = path.join(FAILED_DATA_DIR, 'failed_movers.json');
// const FAILED_CUSTOMERS_FILE = path.join(FAILED_DATA_DIR, 'failed_customers.json');

// /**
//  * 시퀀스를 초기화하는 함수
//  */
// async function resetIdSequence(tableName: string) {
//   const result = await prisma.$queryRawUnsafe<{ max_id: number }[]>(
//     `SELECT MAX(id) AS max_id FROM "${tableName}";`
//   );
//   const maxId = result[0]?.max_id || 0;
//   const sequenceName = `${tableName}_id_seq`;

//   await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${sequenceName}" RESTART WITH ${maxId + 1};`);
//   console.log(`🔄 ${sequenceName} 시퀀스가 ${maxId + 1}로 초기화되었습니다.`);
// }

// /**
//  * 시드 데이터 배치 삽입 함수
//  */
// async function seedDataBatch<T>(
//   data: T[],
//   modelName: string,
//   createFn: (item: T) => Promise<void>,
//   failedDataFile: string
// ) {
//   const failedData: T[] = [];
//   const limit = pLimit(CONCURRENCY_LIMIT);

//   for (let i = 0; i < data.length; i += BATCH_SIZE) {
//     const batch = data.slice(i, i + BATCH_SIZE);
//     const batchNumber = Math.ceil(i / BATCH_SIZE);

//     console.log(`🛠️ ${modelName} 배치 ${batchNumber} 처리 중...`);

//     await Promise.all(
//       batch.map((item, index) =>
//         limit(async () => {
//           try {
//             await createFn(item);
//             console.log(`✅ [${i + index + 1}/${data.length}] ${modelName} 성공`);
//           } catch (error) {
//             console.error(`❌ ${modelName} 실패: ${JSON.stringify(item)}`, error);
//             failedData.push(item);
//           }
//         })
//       )
//     );

//     console.log(`🎉 ${modelName} 배치 ${batchNumber} 완료!`);
//   }

//   if (failedData.length > 0) {
//     await saveFailedData(failedData, failedDataFile);
//     console.log(`❌ 실패한 ${modelName} 데이터를 ${failedDataFile}에 저장했습니다.`);
//   }
// }

// /**
//  * 실패 데이터를 저장하는 함수
//  */
// async function saveFailedData(data: any[], filePath: string) {
//   try {
//     await fs.mkdir(FAILED_DATA_DIR, { recursive: true });
//     await fs.writeFile(filePath, JSON.stringify(data, null, 2));
//     console.log(`📁 실패한 데이터를 ${filePath}에 저장했습니다.`);
//   } catch (error) {
//     console.error(`❌ 실패한 데이터를 저장하는 중 오류 발생: ${filePath}`, error);
//   }
// }

// /**
//  * 실패 데이터를 재처리하는 함수
//  */
// async function retryFailedData<T>(
//   filePath: string,
//   modelName: string,
//   tableName: string,
//   createFn: (item: T) => Promise<void>,
//   updateFn?: (item: T) => Promise<void>
// ) {
//   try {
//     const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);
//     if (!fileExists) {
//       console.log(`✨ ${filePath} 파일이 존재하지 않아 재시도할 데이터가 없습니다.`);
//       return;
//     }

//     console.log(`🔄 ${filePath}에 저장된 실패 데이터를 다시 시도합니다...`);
//     const failedData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
//     if (!Array.isArray(failedData) || failedData.length === 0) {
//       console.log(`✨ ${filePath}에 유효한 데이터가 없어 작업을 건너뜁니다.`);
//       await fs.unlink(filePath); // 유효하지 않은 파일 삭제
//       return;
//     }

//     // 시퀀스 초기화
//     await resetIdSequence(tableName);

//     const failedRetries: T[] = [];
//     const limit = pLimit(CONCURRENCY_LIMIT);

//     await Promise.all(
//       failedData.map((item) =>
//         limit(async () => {
//           try {
//             await createFn(item);
//             if (updateFn) {
//               await updateFn(item); // 필요한 경우 추가 업데이트 작업 수행
//             }
//           } catch (error) {
//             console.error(`❌ ${modelName} 재처리 실패: ${JSON.stringify(item)}`, error);
//             failedRetries.push(item);
//           }
//         })
//       )
//     );

//     if (failedRetries.length === 0) {
//       console.log(`✨ ${filePath} 내 모든 실패 데이터를 성공적으로 처리했습니다.`);
//       await fs.unlink(filePath);
//       console.log(`🗑️ ${filePath} 파일을 삭제했습니다.`);
//     } else {
//       await saveFailedData(failedRetries, filePath);
//       console.log(`❌ 여전히 실패한 데이터를 ${filePath}에 저장했습니다.`);
//     }
//   } catch (error) {
//     console.error(`❌ ${filePath} 재처리 작업 중 오류 발생:`, error);
//   }
// }

// /**
//  * 전체 데이터 삽입 및 실패 데이터 재처리
//  */
// export async function seedDatabase() {
//   try {
//     console.log('🚀 데이터 시딩을 시작합니다...');

//     const usersFilePath = path.join(__dirname, '../data/users.json');
//     const moversFilePath = path.join(__dirname, '../data/movers.json');
//     const customersFilePath = path.join(__dirname, '../data/customers.json');

//     const [usersData, moversData, customersData] = await Promise.all([
//       fs.readFile(usersFilePath, 'utf-8').then(JSON.parse),
//       fs.readFile(moversFilePath, 'utf-8').then(JSON.parse),
//       fs.readFile(customersFilePath, 'utf-8').then(JSON.parse),
//     ]);

//     // 유저 데이터 삽입
//     await seedDataBatch(usersData, '유저', async (user) => {
//       await prisma.user.create({ data: user as any });
//     }, FAILED_USERS_FILE);

//     // 고객 데이터 삽입
//     await seedDataBatch(customersData, '고객', async (customer) => {
//       await prisma.customer.create({ data: customer as any });
//     }, FAILED_CUSTOMERS_FILE);

//     // 이사 업체 데이터 삽입
//     await seedDataBatch(moversData, '이사 업체', async (mover) => {
//       await prisma.mover.create({ data: mover as any });
//     }, FAILED_MOVERS_FILE);

//     console.log('🔄 실패한 데이터를 재시도합니다...');
//     await retryFailedData(
//       FAILED_USERS_FILE,
//       '유저',
//       'user',
//       async (user) => {
//         await prisma.user.create({ data: user as any });
//       }
//     );

//     await retryFailedData(
//       FAILED_CUSTOMERS_FILE,
//       '고객',
//       'customer',
//       async (customer) => {
//         await prisma.customer.create({ data: customer as any });
//       }
//     );

//     await retryFailedData(
//       FAILED_MOVERS_FILE,
//       '이사 업체',
//       'mover',
//       async (mover) => {
//         await prisma.mover.create({ data: mover as any });
//       }
//     );

//     // user의 createdAt 업데이트
//     console.log('🛠️ user의 createdAt 업데이트 중...');
//     await prisma.$executeRawUnsafe(`
//       UPDATE "user"
//       SET "createdAt" = COALESCE(
//         (SELECT "createdAt" FROM "customer" WHERE "customer"."user_id" = "user"."id"),
//         (SELECT "createdAt" FROM "mover" WHERE "mover"."user_id" = "user"."id")
//       )
//       WHERE EXISTS (
//         SELECT 1 FROM "customer" WHERE "customer"."user_id" = "user"."id"
//       )
//       OR EXISTS (
//         SELECT 1 FROM "mover" WHERE "mover"."user_id" = "user"."id"
//       );
//     `);
//     console.log('✅ user의 createdAt 업데이트 완료.');

//     console.log('✨ 모든 데이터를 성공적으로 처리했습니다!');
//   } catch (error) {
//     console.error('🔥 데이터 시딩 중 오류 발생:', error);
//   } 
// }

// // 파일이 직접 실행되었는지 확인
// if (require.main === module) {
//   seedDatabase()
//     .catch((error) => {
//       console.error('❌ 시딩 작업 중 오류 발생:', error);
//     })
//     .finally(async () => {
//       await prisma.$disconnect();
//       console.log('🔌 Prisma 클라이언트 연결이 해제되었습니다.');
//     });
// }
