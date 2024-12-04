import { serviceType } from '@prisma/client';
import { getServiceTypes } from '../generate/getServiceType';
import { getRandomAddress } from '../generate/getAddress';
import * as fs from 'fs';

const movingInfoCount = 5000; 

type MovingInfoData = {
  movingType: serviceType;
  movingDate: string; 
  departure: string;
  arrival: string;
  createdAt: Date; 
};

// 무작위 날짜 생성 함수
function generateRandomDate(): Date {
  const start = new Date('2024-07-02');
  const end = new Date('2024-12-03');
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date; 
}

// movingDate를 createdAt의 43일 이후로 설정하는 함수
function calculateMovingDate(createdAt: Date): string {
  const movingDate = new Date(createdAt);
  movingDate.setDate(movingDate.getDate() + 43); // 43일을 임의로 추가

  const year = movingDate.getFullYear(); // 날짜 변환을 위한 날짜 추출
  const month = String(movingDate.getMonth() + 1).padStart(2, '0'); 
  const day = String(movingDate.getDate()).padStart(2, '0');

  return `${year}. ${month}. ${day}`;   // yyyy. mm. dd 형식\
}

// 데이터 생성
function generateMovingInfo(count: number): MovingInfoData[] {
  const movingInfoList: MovingInfoData[] = [];
  
  for (let i = 0; i < count; i++) {
    const createdAt = generateRandomDate(); // 생성 시간
    const movingDate = calculateMovingDate(createdAt); // 43일 이후 날짜

    movingInfoList.push({
      movingType: getServiceTypes() as serviceType, // 서비스 타입 생성
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
    createdAt: item.createdAt.toISOString(), // Date 객체를 ISO 문자열로 변환
  }));
  fs.writeFileSync('./data/movingInfo.json', JSON.stringify(jsonData, null, 2), 'utf-8');

  console.log(`${movingInfoCount}개의 MovingInfo 데이터가 movingInfo.json에 저장되었습니다.`);
})();