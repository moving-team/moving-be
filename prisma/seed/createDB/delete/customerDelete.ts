import { PrismaClient } from '@prisma/client';
import { resetCustomerSequence } from '../../util/resetSequence';

const prisma = new PrismaClient();

export async function deleteCustomersFromId() {
  const startId = 11; // 시작 ID

  try {
    console.log(`Deleting customers with ID >= ${startId}...`);

    // customer 데이터 삭제
    const deletedCount = await prisma.customer.deleteMany({
      where: {
        id: {
          gte: startId, // ID가 startId 이상인 모든 레코드
        },
      },
    });

    console.log(`Successfully deleted ${deletedCount.count} customers with ID >= ${startId}.`);

    // customer 모델 ID 시퀀스 초기화
    await resetCustomerSequence(startId);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during deletion:', error.message);
    } else {
      console.error('An unknown error occurred:', error);
    }
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

// deleteCustomersFromId();
