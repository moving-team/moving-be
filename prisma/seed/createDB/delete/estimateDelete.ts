import { PrismaClient } from '@prisma/client';
import { resetEstimateSequence } from "../util/resetSequence";

const prisma = new PrismaClient();

export async function deleteEstimateFromId() {
  const startId = 11; // 시작 ID

  try {
    console.log(`Deleting estimate with ID >= ${startId}...`);

    // 데이터 삭제
    const deletedCount = await prisma.estimate.deleteMany({
      where: {
        id: {
          gte: startId, 
        },
      },
    });

    console.log(`Successfully deleted ${deletedCount.count} movers with ID >= ${startId}.`);

    // mover 모델 ID 시퀀스 초기화
    await resetEstimateSequence(startId);
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

deleteEstimateFromId()