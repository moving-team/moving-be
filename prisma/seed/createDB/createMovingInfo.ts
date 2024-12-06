import { serviceType } from '@prisma/client';
import { getServiceTypes } from '../generate/getServiceType';
import { getRandomAddress } from '../generate/getAddress';
import * as fs from 'fs';

const movingInfoCount = 10000; // 생성할 데이터 개수

type MovingInfoData = {
  movingType: serviceType;
  movingDate: Date; 
  departure: string;
  arrival: string;
  createdAt: Date;
};

// 무작위 날짜 생성 함수
function generateRandomDate(): Date {
  const start = new Date('2023-01-01');
  const end = new Date('2024-12-04');
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date;
}

// movingDate를 createdAt의 43일 이후로 설정하는 함수
function calculateMovingDate(createdAt: Date): Date {
  const movingDate = new Date(createdAt);
  movingDate.setDate(movingDate.getDate() + 43); // 43일 추가
  return movingDate; // Date 객체 반환
}

// 데이터 생성
function generateMovingInfo(count: number): MovingInfoData[] {
  const movingInfoList: MovingInfoData[] = [];
  
  for (let i = 0; i < count; i++) {
    const createdAt = generateRandomDate(); // 생성 시간
    const movingDate = calculateMovingDate(createdAt); // 43일 이후 날짜

    // 누적 생성 갯수 출력
    process.stdout.write(
      `Processing: ${i + 1}/${count} movingInfo\r`
    );

    movingInfoList.push({
      movingType: getServiceTypes() as serviceType, 
      movingDate, 
      departure: getRandomAddress(),
      arrival: getRandomAddress(),
      createdAt,
    });
  }

  return movingInfoList;
}

// 데이터 생성 및 저장
(() => {
  const movingInfoList = generateMovingInfo(movingInfoCount);

  // JSON 데이터 변환 및 저장
  const jsonData = movingInfoList.map((item: MovingInfoData) => ({
    ...item,
    movingDate: item.movingDate.toISOString(),
    createdAt: item.createdAt.toISOString(),
  }));
  fs.writeFileSync('./data/movingInfo.json', JSON.stringify(jsonData, null, 2), 'utf-8');

  console.log(`${movingInfoCount}개의 MovingInfo 데이터가 movingInfo.json에 저장되었습니다.`);
})();
