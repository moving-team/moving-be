import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateMovingDataByIdOrder() {
  try {
    // 1. JSON 파일 읽기
    const jsonData = await fs.readFile('../data/movingInfo.json', 'utf-8');
    const movingData = JSON.parse(jsonData);

    // 2. 데이터베이스 데이터 가져오기 (id 순으로 정렬)
    const dbData = await prisma.movingInfo.findMany({
      orderBy: {
        id: 'asc', // id 순으로 정렬
      },
    });

    // 3. 순서대로 매칭하여 업데이트
    for (let i = 0; i < dbData.length; i++) {
      const dbItem = dbData[i];
      const jsonItem = movingData[i];

      // 데이터 업데이트
      await prisma.movingInfo.update({
        where: { id: dbItem.id }, // DB의 고유 ID 사용
        data: {
          departure: jsonItem.departure,
          arrival: jsonItem.arrival,
        },
      });
    }

    console.log('ID 순서 기반 데이터 업데이트 완료!');
  } catch (error) {
    console.error('데이터 업데이트 중 오류 발생:', error);
  }
}

updateMovingDataByIdOrder();
