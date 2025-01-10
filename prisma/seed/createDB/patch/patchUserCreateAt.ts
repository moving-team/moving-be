import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function getBeforeDate(): Date {
  const startDate = new Date('2021-01-01T00:00:00');
  const endDate = new Date('2022-12-31T23:59:59');
  if (startDate >= endDate) {
    throw new Error('startDate must be earlier than endDate');
  }

  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  const randomTimestamp = Math.floor(
    Math.random() * (endTimestamp - startTimestamp + 1) + startTimestamp
  );

  return new Date(randomTimestamp);
}

async function updateUserCreatedAt() {
  try {
    // 모든 User 가져오기
    const users = await prisma.user.findMany();

    for (const user of users) {
      const randomDate = getBeforeDate();

      // 사용자마다 createdAt 업데이트
      await prisma.user.update({
        where: { id: user.id },
        data: { createdAt: randomDate },
      });

      console.log(`Updated user ${user.id} with createdAt: ${randomDate}`);
    }

    console.log('All users updated successfully!');
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
updateUserCreatedAt();
