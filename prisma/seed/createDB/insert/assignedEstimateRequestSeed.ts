import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function seedAssignedEstimateRequest() {
  try {
    console.log('Start seeding AssignedEstimateRequest...');

    // JSON 파일 경로
    const filePath = '../data/assignedEstimateRequest.json';

    // JSON 데이터 읽기
    const assignedRequests = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // 데이터 타입 검증
    if (!Array.isArray(assignedRequests)) {
      throw new Error(`Invalid data format in ${filePath}: Root should be an array.`);
    }

    console.log(`Inserting ${assignedRequests.length} AssignedEstimateRequest records...`);

    // 데이터 삽입
    if (assignedRequests.length > 0) {
      await prisma.assignedEstimateRequest.createMany({ data: assignedRequests, skipDuplicates: true });
    }

    console.log('AssignedEstimateRequest seeded successfully!');
  } catch (error) {
    console.error('Error during AssignedEstimateRequest seeding:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

seedAssignedEstimateRequest();
