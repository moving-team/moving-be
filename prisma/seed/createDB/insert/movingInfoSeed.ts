import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function seedMovingInfo() {
  try {
    console.log('Start seeding MovingInfo data...');

    // JSON 파일 경로
    const movingInfoFilePath = '../data/movingInfo.json';

    // JSON 데이터 읽기
    const movingInfoData = JSON.parse(fs.readFileSync(movingInfoFilePath, 'utf-8'));

    // 데이터 검증
    if (!Array.isArray(movingInfoData)) {
      throw new Error(`Invalid data format in ${movingInfoFilePath}: Root should be an array.`);
    }

    console.log(`Inserting ${movingInfoData.length} MovingInfo records...`);

    // 데이터 삽입
    if (movingInfoData.length > 0) {
      await prisma.movingInfo.createMany({
        data: movingInfoData.map((info) => ({
          movingType: info.movingType, 
          movingDate: info.movingDate, 
          departure: info.departure, 
          arrival: info.arrival, 
          createdAt: new Date(info.createdAt),
        })),
        skipDuplicates: true, 
      });
    }

    console.log('MovingInfo data seeded successfully!');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during seeding:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('An unknown error occurred:', error);
    }
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

seedMovingInfo();
