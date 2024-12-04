import { PrismaClient } from '@prisma/client';
import { getRandomReview } from "../generate/getReview";
import * as fs from 'fs';

const prisma = new PrismaClient();

const createCount = 3000; // 생성할 리뷰 수

type Review = {
  estimateId: number;
  customerId: number;
  moverId: number;
  score: number;
  description: string;
  createdAt: Date;
};

// 점수 생성 함수 (가중치 적용)
function getWeightedRandomScore(): number {
  const scores = [1, 2, 3, 4, 5];
  const weights = [5, 3, 2, 30, 60]; // 가중치

  const weightedScores = scores.flatMap((score, index) =>
    Array(weights[index]).fill(score)
  );

  const randomIndex = Math.floor(Math.random() * weightedScores.length);
  return weightedScores[randomIndex];
}

// 랜덤한 createdAt 생성 함수
function getRandomCreatedAt(movingDate: Date): Date {
  const randomHours = Math.floor(Math.random() * (72 - 24 + 1)) + 24; // 24 ~ 72시간
  const randomCreatedAt = new Date(movingDate);
  randomCreatedAt.setHours(randomCreatedAt.getHours() + randomHours);

  const now = new Date();
  return randomCreatedAt > now ? now : randomCreatedAt; // 미래 시간 방지
}

async function generateReviews(): Promise<void> {
  try {
    console.log('Start generating Review data...');

    // 데이터베이스에서 isMovingComplete = true인 Estimate 가져오기
    const estimates = await prisma.estimate.findMany({
      where: { isMovingComplete: true },
      include: {
        MovingInfo: {
          select: { movingDate: true },
        },
      },
    });

    if (estimates.length === 0) {
      throw new Error('No completed estimates found in the database.');
    }

    // 최대 생성 개수 조정
    const adjustedCount = Math.min(createCount, estimates.length);

    if (estimates.length < createCount) {
      console.log(
        `Requested createCount (${createCount}) exceeds available completed estimates (${estimates.length}). Adjusting to ${adjustedCount}.`
      );
    }

    // Review 데이터 생성
    const reviews: Review[] = [];
    for (let i = 0; i < adjustedCount; i++) {
      const estimate = estimates[i];
      const movingDate = new Date(estimate.MovingInfo.movingDate);

      reviews.push({
        estimateId: estimate.id,
        customerId: estimate.customerId,
        moverId: estimate.moverId,
        score: getWeightedRandomScore(), // 가중치 기반 점수
        description: getRandomReview(),
        createdAt: getRandomCreatedAt(movingDate), // 랜덤한 createdAt 생성
      });
    }

    // JSON 파일로 저장
    const filePath = './data/reviews.json';
    fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2), 'utf-8');

    console.log(`Review data has been saved to ${filePath}`);
  } catch (error) {
    console.error('Error during Review data generation:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

generateReviews();
