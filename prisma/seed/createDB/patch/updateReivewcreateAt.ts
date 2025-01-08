import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 주어진 함수
function getRandomFutureDate(baseDate: Date): Date {
  const randomHours = Math.floor(Math.random() * 72) + 1;
  return new Date(baseDate.getTime() + randomHours * 60 * 60 * 1000);
}

async function updateReviewCreateAtBasedOnMovingDate() {
  try {
    // 1. 모든 리뷰와 관련된 movingDate를 가져옵니다.
    const reviewsWithMovingDate = await prisma.review.findMany({
      select: {
        id: true, // 리뷰의 ID
        createdAt: true, // 현재 createdAt
        Estimate: {
          select: {
            MovingInfo: {
              select: {
                movingDate: true, // movingDate를 가져옴
              },
            },
          },
        },
      },
    });

    // 2. movingDate를 기준으로 createdAt을 업데이트합니다.
    for (const review of reviewsWithMovingDate) {
      const movingDate = review.Estimate?.MovingInfo?.movingDate;

      if (movingDate) {
        const newCreateAt = getRandomFutureDate(new Date(movingDate));

        // 리뷰의 createdAt을 업데이트
        await prisma.review.update({
          where: {
            id: review.id,
          },
          data: {
            createdAt: newCreateAt,
          },
        });

        console.log(
          `Review ID ${review.id}: Updated createdAt from ${review.createdAt} to ${newCreateAt}`
        );
      } else {
        console.warn(`Review ID ${review.id} has no associated movingDate.`);
      }
    }
    console.log("All reviews updated successfully.");
  } catch (error) {
    console.error("Error updating review createdAt:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
updateReviewCreateAtBasedOnMovingDate();
