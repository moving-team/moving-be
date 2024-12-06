import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function seedReviews(): Promise<void> {
  try {
    console.log('Start seeding Review data...');

    // JSON 파일 경로
    const filePath = '../data/reviews.json';

    // JSON 데이터 읽기
    const reviews = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // 데이터 검증
    if (!Array.isArray(reviews)) {
      throw new Error('Invalid data format: reviews.json should be an array.');
    }

    console.log(`Inserting ${reviews.length} reviews...`);

    // 데이터 삽입
    await prisma.review.createMany({
      data: reviews,
      skipDuplicates: true, // 중복된 데이터 무시
    });

    console.log('Reviews data seeded successfully!');
  } catch (error) {
    console.error('Error during Review data seeding:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

// 실행
seedReviews();
