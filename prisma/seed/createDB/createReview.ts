import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { getRandomReview } from '../generate/getReview';

const prisma = new PrismaClient();

type Review = {
  estimateId: number;
  customerId: number;
  moverId: number;
  score: number;
  description: string;
  createdAt: Date;
};

// 가중치 누적 배열을 미리 생성
const scores = [1, 2, 3, 4, 5];
const weights = [5, 1, 2, 25, 67];
const cumulativeWeights = weights.map(
  (
    (sum) => (weight) =>
      (sum += weight)
  )(0)
);

// 점수 생성 최적화
function getWeightedRandomScore(): number {
  const random =
    Math.random() * cumulativeWeights[cumulativeWeights.length - 1];
  return scores[cumulativeWeights.findIndex((weight) => random <= weight)];
}

// 랜덤 시간 생성 최적화
function getRandomFutureDate(baseDate: Date): Date {
  const randomHours = Math.floor(Math.random() * 72) + 1;
  return new Date(baseDate.getTime() + randomHours * 60 * 60 * 1000);
}

// 리뷰 생성
async function generateReviews(): Promise<void> {
  try {
    console.log('Start generating Review data...');

    const estimates = await prisma.estimate.findMany({
      where: { status: 'ACCEPTED', isMovingComplete: true },
      select: { 
        id: true, 
        customerId: true, 
        moverId: true, 
        createdAt: true,
        MovingInfo: {
          select: {
            movingDate: true,
          }
        }
      }, // 필요한 필드만 가져옴
    });

    if (estimates.length === 0) {
      throw new Error('No valid Estimate data found for generating reviews.');
    }

    const batchSize = 100; // 배치 크기
    const reviews: Review[] = []; // 타입 명시
    let totalGenerated = 0; // 누적 생성 개수

    for (const estimate of estimates) {
      const randomCreatedAt = getRandomFutureDate(new Date(estimate.MovingInfo.movingDate));
      reviews.push({
        estimateId: estimate.id,
        customerId: estimate.customerId,
        moverId: estimate.moverId,
        score: getWeightedRandomScore(),
        description: getRandomReview(),
        createdAt: randomCreatedAt,
      });

      totalGenerated++; // 카운트 1씩 증가
      process.stdout.write(
        `Generating Reviews: ${totalGenerated}/${estimates.length}\r`
      );

      // 배치 완료 시 로그 출력
      if (
        totalGenerated % batchSize === 0 ||
        totalGenerated === estimates.length
      ) {
        console.log(
          `Batch Completed: ${Math.ceil(
            totalGenerated / batchSize
          )} | Total: ${totalGenerated}`
        );
      }
    }

    console.log(); // 줄바꿈

    // JSON 저장
    const reviewFilePath = './data/reviews.json';
    const writeStream = fs.createWriteStream(reviewFilePath, {
      encoding: 'utf-8',
    });
    writeStream.write(JSON.stringify(reviews, null, 2));
    writeStream.end();

    console.log(`${reviews.length}개의 Review 데이터가 생성되었습니다.`);
    console.log(`Review 데이터가 ${reviewFilePath}에 저장되었습니다.`);
  } catch (error) {
    console.error('Error during Review data generation:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

// 실행
generateReviews();
