import { PrismaClient } from '@prisma/client';
import { resetUserSequence } from '../../util/resetSequence';

const prisma = new PrismaClient();

export async function deleteUsersFromId() {
  const startId = 17; // 시작 ID

  try {
    console.log(`Deleting users with ID >= ${startId}...`);

    // 삭제 작업 실행
    const deletedCount = await prisma.user.deleteMany({
      where: {
        id: {
          gte: startId, // ID가 startId 이상인 모든 레코드
        },
      },
    });

    console.log(`Successfully deleted ${deletedCount.count} users with ID >= ${startId}.`);

    // ID 시퀀스 초기화
    await resetUserSequence(startId);
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

deleteUsersFromId();
