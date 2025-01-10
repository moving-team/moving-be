import { prisma } from '../helper/helperDB';
import * as fs from 'fs/promises';
import { getRandomReview } from '../generate/getReview';
import path from 'path';

const BATCH_SIZE = 100; // 배치 크기

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

// 단일 리뷰 생성
function generateReview(estimate: any): Review {
  const randomCreatedAt = getRandomFutureDate(
    new Date(estimate.MovingInfo.movingDate)
  );
  return {
    estimateId: estimate.id,
    customerId: estimate.customerId,
    moverId: estimate.moverId,
    score: getWeightedRandomScore(),
    description: getRandomReview(),
    createdAt: randomCreatedAt,
  };
}

// 리뷰 데이터 생성 및 저장
export async function createReview(): Promise<void> {
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
          },
        },
      }, // 필요한 필드만 가져옴
    });

    if (estimates.length === 0) {
      throw new Error('No valid Estimate data found for generating reviews.');
    }

    const totalBatches = Math.ceil(estimates.length / BATCH_SIZE);

    const reviewFilePath = path.join(__dirname, './data/reviews.json');
    await fs.mkdir(path.dirname(reviewFilePath), { recursive: true }); // 폴더 생성
    const writeStream = await fs.open(reviewFilePath, 'w'); // 파일 스트림 열기

    await writeStream.write('['); // JSON 배열 시작

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, estimates.length);
      const batch = estimates.slice(start, end);

      console.log(
        `Processing batch ${batchIndex + 1}/${totalBatches}... (${batch.length} records)`
      );

      const reviews = batch.map((estimate) => generateReview(estimate));
      const jsonBatch = JSON.stringify(reviews, null, 2).slice(1, -1); // JSON 문자열화

      // 스트리밍 방식으로 기록
      await writeStream.write(`${batchIndex === 0 ? '' : ','}${jsonBatch}`);

      console.log(
        `Batch ${batchIndex + 1}/${totalBatches} completed. (${end} records processed)`
      );
    }

    await writeStream.write(']'); // JSON 배열 종료
    await writeStream.close(); // 스트림 닫기

    console.log(`All reviews saved to ${reviewFilePath}.`);
  } catch (error) {
    console.error('Error during Review data generation:', error);
  }
}

// 실행
if (require.main === module) {
  createReview()
    .catch((error) => {
      console.error('❌ 오류 발생:', error);
    })
    .finally(async () => {
      try {
        console.log('🔌 Prisma 클라이언트 연결을 해제합니다.');
        await prisma.$disconnect();
        console.log('✔️ 연결이 안전하게 해제되었습니다.');
      } catch (disconnectError) {
        console.error('❌ Prisma 연결 해제 중 오류 발생:', disconnectError);
      }
    });
}