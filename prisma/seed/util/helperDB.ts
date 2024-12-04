import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 테이블과 Prisma 모델 매핑
 */
const prismaModels: Record<string, any> = {
  user: prisma.user,
  mover: prisma.mover,
  customer: prisma.customer,
  review: prisma.review,
  moving_info: prisma.movingInfo,
  estimate_requests: prisma.estimateRequest,
  assigned_estimate_request: prisma.assignedEstimateRequest,
  estimate: prisma.estimate,
  favorite: prisma.favorite,
  notification: prisma.notification,
};

/**
 * 테이블과 시퀀스 매핑
 */
const tableSequenceMapping: Record<string, string> = {
  user: 'user_id_seq',
  mover: 'mover_id_seq',
  customer: 'customer_id_seq',
  review: 'review_id_seq',
  moving_info: 'moving_info_id_seq',
  estimate_requests: 'estimate_requests_id_seq',
  assigned_estimate_request: 'assigned_estimate_request_id_seq',
  estimate: 'estimate_id_seq',
  favorite: 'favorite_id_seq',
  notification: 'notification_id_seq',
};

/**
 * 데이터베이스에서 사용 가능한 테이블 목록을 가져오는 함수 (_prisma_migrations 제외)
 */
async function getTables(): Promise<string[]> {
  try {
    const tables = await prisma.$queryRaw<{ table_name: string }[]>(
      Prisma.sql`SELECT table_name
                 FROM information_schema.tables
                 WHERE table_schema = 'public';`
    );

    // _prisma_migrations 테이블 제외
    return tables
      .map((t) => t.table_name)
      .filter((tableName) => tableName !== '_prisma_migrations');
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ 테이블 목록을 가져오는 중 에러 발생:', error.message);
    }
    return [];
  }
}

/**
 * 특정 테이블 데이터를 삭제하고 시퀀스를 초기화하는 함수
 * @param tableName 삭제할 테이블 이름
 * @param startId 삭제를 시작할 ID
 */
async function deleteFromTable(tableName: string, startId: number) {
  const model = prismaModels[tableName];
  const sequenceName = tableSequenceMapping[tableName];

  if (!model || !sequenceName) {
    console.error(`⚠️ 테이블 ${tableName}에 대한 모델 또는 시퀀스 매핑이 없습니다.`);
    return;
  }

  try {
    console.log(`🗑️ ${tableName} 테이블에서 ID ${startId} 이상 데이터를 삭제 중...`);
    const deleteCount = await model.deleteMany({
      where: { id: { gte: startId } },
    });
    console.log(`✅ ${tableName} 테이블에서 ${deleteCount.count}개의 데이터가 삭제되었습니다.`);

    console.log(`🔄 ${sequenceName} 시퀀스를 ${startId}로 초기화 중...`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE ${sequenceName} RESTART WITH ${startId}`);
    console.log(`✔️ ${sequenceName} 시퀀스가 ${startId}로 초기화되었습니다.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ ${tableName} 테이블 삭제 중 에러 발생:`, error.message);
    }
  }
}

/**
 * 모든 테이블 데이터를 삭제하고, 시퀀스를 초기화하는 함수 (_prisma_migrations 제외)
 */
async function clearAllTables() {
  try {
    const tables = await getTables();

    if (tables.length === 0) {
      console.log('📂 테이블이 존재하지 않습니다.');
      return;
    }

    console.log('🗑️ 모든 테이블 데이터를 삭제 중...');
    for (const table of tables) {
      // _prisma_migrations 테이블은 삭제하지 않음
      if (table === '_prisma_migrations') {
        console.log(`🚫 ${table} 테이블은 건너뜁니다.`);
        continue;
      }

      const model = prismaModels[table];
      const sequenceName = tableSequenceMapping[table];

      if (!model || !sequenceName) {
        console.warn(`⚠️ 테이블 ${table}에 대한 모델 또는 시퀀스 매핑이 없습니다.`);
        continue;
      }

      try {
        await model.deleteMany();
        console.log(`✅ ${table} 테이블 데이터 삭제 완료.`);

        console.log(`🔄 ${sequenceName} 시퀀스를 1로 초기화 중...`);
        await prisma.$executeRawUnsafe(`ALTER SEQUENCE ${sequenceName} RESTART WITH 1`);
        console.log(`✔️ ${sequenceName} 시퀀스 초기화 완료.`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`❌ ${table} 테이블 데이터 삭제 중 에러 발생:`, error.message);
        }
      }
    }

    console.log('🎉 모든 테이블 데이터와 시퀀스 초기화 완료.');
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ 전체 테이블 초기화 중 에러 발생:', error.message);
    }
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🚀 데이터베이스 관리 작업을 시작합니다.');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = (question: string): Promise<string> => {
    return new Promise((resolve) => readline.question(question, resolve));
  };

  while (true) {
    console.log('\n다음 작업 중 하나를 선택하세요:');
    console.log('1. 모든 테이블 데이터 초기화 및 시퀀스 초기화');
    console.log('2. 특정 테이블 데이터 삭제 및 시퀀스 초기화');
    console.log('3. 작업 종료');

    const choice = await askQuestion('선택: ');

    if (choice === '1') {
      await clearAllTables();
    } else if (choice === '2') {
      const tables = await getTables();

      if (tables.length === 0) {
        console.log('📂 테이블이 존재하지 않습니다.');
        continue;
      }

      console.log('📋 사용 가능한 테이블 목록:');
      tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table}`);
      });

      const tableChoice = parseInt(await askQuestion('테이블 번호를 선택하세요: '), 10);
      if (isNaN(tableChoice) || tableChoice < 1 || tableChoice > tables.length) {
        console.log('⚠️ 잘못된 선택입니다.');
        continue;
      }

      const tableName = tables[tableChoice - 1];
      const startId = parseInt(await askQuestion('시작 ID를 입력하세요: '), 10);

      if (isNaN(startId)) {
        console.log('⚠️ 잘못된 ID 입력입니다.');
        continue;
      }

      await deleteFromTable(tableName, startId);
    } else if (choice === '3') {
      console.log('👋 작업을 종료합니다.');
      break;
    } else {
      console.log('⚠️ 잘못된 선택입니다. 다시 시도하세요.');
    }
  }

  readline.close();
}

main().catch((error) => {
  console.error('❌ 프로그램 실행 중 에러 발생:', error);
  prisma.$disconnect();
});
