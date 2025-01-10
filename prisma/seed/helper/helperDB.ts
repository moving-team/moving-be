import { PrismaClient, Prisma } from '@prisma/client';
import { seedingMain } from '../createDB/insert/seedingMain';
import { findLogAndFixMismatchedCustomerIds } from '../createDB/patch/updateEstimateCustomerId';

export const prisma = new PrismaClient();

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(reason: string) {
  console.log(`🔌 ${reason} - Prisma 연결을 해제합니다.`);
  try {
    await prisma.$disconnect();
    console.log('✔️ Prisma 연결이 안전하게 해제되었습니다.');
  } catch (error) {
    console.error('❌ Prisma 연결 해제 중 오류 발생:', error);
  } finally {
    console.log('👋 프로세스를 종료합니다.');
    process.exit(0);
  }
}

/**
 * 데이터 삭제 및 시퀀스 초기화 함수
 * @param tableName 테이블 이름
 * @param startId 시작 ID
 */
async function resetTable(tableName: string, startId: number = 1) {
  try {
    console.log(`🗑️ ${tableName} 테이블 데이터 삭제 중...`);
    const deleteCount = await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}" WHERE id >= ${startId}`);
    console.log(`✅ ${tableName} 테이블에서 ${deleteCount}개의 데이터가 삭제되었습니다.`);

    const sequenceName = `${tableName}_id_seq`;
    console.log(`🔄 ${sequenceName} 시퀀스를 ${startId}로 초기화 중...`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${sequenceName}" RESTART WITH ${startId}`);
    console.log(`✔️ ${sequenceName} 시퀀스가 ${startId}로 초기화되었습니다.`);
  } catch (error) {
    console.error(`❌ ${tableName} 테이블 데이터 삭제 또는 시퀀스 초기화 중 오류 발생:`, error);
  }
}

async function clearAllTables() {
  try {
    // Prisma 클라이언트 트랜잭션 시작
    await prisma.$transaction(async (tx) => {
      // 삭제 순서 정의
      const deleteOrder = [
        "notification",
        "review",
        "assigned_estimate_request",
        "favorite",
        "estimate",
        "estimate_requests",
        "moving_info",
        "mover",
        "customer",
        "user",
      ];

      // 각 테이블 데이터 삭제 및 시퀀스 초기화
      for (const table of deleteOrder) {
        await resetTable(table); // resetTable 활용
      }

      console.log('✅ 초기화 순서에 따라 지정된 모든 테이블 삭제 및 시퀀스 초기화 완료.');

      // 남아 있는 테이블 확인 (삭제 순서와 _prisma_migrations 제외)
      const remainingTables = await tx.$queryRaw<{ table_name: string }[]>(
        Prisma.sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name NOT IN (${Prisma.join([...deleteOrder, "_prisma_migrations"])});
        `
      );

      if (remainingTables.length > 0) {
        console.log('⚠️ 삭제되지 않은 테이블이 발견되었습니다:');
        remainingTables.forEach((table) => console.log(`- ${table.table_name}`));

        // 남은 테이블 삭제 및 시퀀스 초기화
        for (const table of remainingTables) {
          await resetTable(table.table_name); // resetTable 활용
        }
      } else {
        console.log('🎉 모든 테이블이 성공적으로 초기화되었습니다.');
      }
    }, { maxWait: 15000, timeout: 1000 * 60 * 10 }); // 트랜잭션 시간 10분
  } catch (error) {
    console.error('❌ 모든 테이블 초기화 중 오류 발생:', error);
  }
}

/**
 * 메인 함수
 */
async function main() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = (query: string): Promise<string> => new Promise((resolve) => readline.question(query, resolve));

  // Graceful shutdown handlers for termination signals
  process.on('SIGINT', () => gracefulShutdown('SIGINT(Ctrl+C) 신호'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM 신호'));

  try {
    while (true) {
      console.log('\n다음 작업 중 하나를 선택하세요:');
      console.log('1. 모든 테이블 데이터 초기화 및 시퀀스 초기화');
      console.log('2. 특정 테이블 데이터 삭제 및 시퀀스 초기화');
      console.log('3. 데이터 전체 순차 시딩 작업');
      console.log('4. Estimate에서 CustomerId 업데이트 (일단 사용 ❌❌❌)')
      console.log('5. 작업 종료');

      const choice = await askQuestion('선택: ');

      if (choice === '1') {
        await clearAllTables();
      } else if (choice === '2') {
        const tables = await prisma.$queryRaw<{ table_name: string }[]>(
          Prisma.sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
        );

        const filteredTables = tables
          .map((t) => t.table_name)
          .filter((tableName) => tableName !== '_prisma_migrations');

        if (filteredTables.length === 0) {
          console.log('📂 삭제할 테이블이 없습니다.');
          continue;
        }

        console.log('📋 사용 가능한 테이블 목록:');
        filteredTables.forEach((table, index) => {
          console.log(`${index + 1}. ${table}`);
        });

        const tableChoice = parseInt(await askQuestion('테이블 번호를 선택하세요: '), 10);
        if (isNaN(tableChoice) || tableChoice < 1 || tableChoice > filteredTables.length) {
          console.log('⚠️ 잘못된 선택입니다.');
          continue;
        }

        const tableName = filteredTables[tableChoice - 1];
        const startId = parseInt(await askQuestion('시작 ID를 입력하세요 (기본값 1): '), 10) || 1;

        await resetTable(tableName, startId);
      } else if (choice === '3') {
        const isTest = await askQuestion('Test Mode? (y/n): ') === 'y';
        console.log('isTest?? : ', isTest);

        console.log('🚀 데이터 전체 순차 시딩 중...');
        await seedingMain(isTest);
        
      } else if (choice === '4') {
        console.log('🚀 업데이트를 시도합니다.');
        await findLogAndFixMismatchedCustomerIds();
      } else if (choice === '5') {
        console.log('👋 작업을 종료합니다.');
        break;
      } else {
        console.log('⚠️ 잘못된 선택입니다. 다시 시도하세요.');
      }
    }
  } catch (error) {
    console.error('❌ 프로그램 실행 중 에러 발생:', error);
  } finally {
    readline.close();
    await prisma.$disconnect();
    console.log('🔌 Prisma 클라이언트 연결이 해제되었습니다.');
  }
}

process.on('uncaughtException', (error) => {
  console.error('🔥 예기치 않은 오류 발생:', error);
  gracefulShutdown('예기치 않은 예외 처리');
});

if (require.main === module) {
  main();
}
