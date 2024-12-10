import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function seedEstimates() {
  try {
    console.log('Start seeding Estimate data...');

    // JSON 파일 경로
    const filePath = '../data/estimates.json';

    // JSON 데이터 읽기
    const estimates = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // 데이터 타입 검증
    if (!Array.isArray(estimates)) {
      throw new Error('Invalid data format: estimates.json should be an array.');
    }

    console.log(`Inserting ${estimates.length} estimates...`);

    // 데이터 삽입
    await prisma.estimate.createMany({
      data: estimates,
    });

    console.log('Estimates data seeded successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

// 실행
seedEstimates();
