import { PrismaClient } from '@prisma/client';
import { resetMoverSequence } from '../util/resetSequence';

const prisma = new PrismaClient();

export async function deleteMoversFromId() {
  const startId = 7; // 시작 ID

  try {
    console.log(`Deleting movers with ID >= ${startId}...`);

    // mover 데이터 삭제
    const deletedCount = await prisma.mover.deleteMany({
      where: {
        id: {
          gte: startId, // ID가 startId 이상인 모든 레코드
        },
      },
    });

    console.log(`Successfully deleted ${deletedCount.count} movers with ID >= ${startId}.`);

    // mover 모델 ID 시퀀스 초기화
    await resetMoverSequence(startId);
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

// deleteMoversFromId();
