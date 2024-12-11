import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function seedEstimateRequest() {
  try {
    console.log('Start seeding EstimateRequest...');

    // JSON 파일 경로
    const estimateRequestFilePath = '../data/estimateRequest.json';

    // JSON 데이터 읽기
    const estimateRequests = JSON.parse(fs.readFileSync(estimateRequestFilePath, 'utf-8'));

    // 데이터 타입 검증
    if (!Array.isArray(estimateRequests)) {
      throw new Error(`Invalid data format in ${estimateRequestFilePath}: Root should be an array.`);
    }

    console.log(`Inserting ${estimateRequests.length} EstimateRequest records...`);

    // 데이터 삽입
    if (estimateRequests.length > 0) {
      await prisma.estimateRequest.createMany({ data: estimateRequests, skipDuplicates: true });
    }

    console.log('EstimateRequest seeded successfully!');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during EstimateRequest seeding:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('An unknown error occurred:', error);
    }
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

seedEstimateRequest();
