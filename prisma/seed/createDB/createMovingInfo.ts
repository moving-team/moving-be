import { serviceType } from '@prisma/client';
import { getServiceTypes } from '../generate/generateServiceType';
import { getRandomAddress } from '../generate/generateAddress';
import * as fs from 'fs';

const movingInfoCount = 3500; // 생성할 MovingInfo 수

type MovingInfoData = {
  movingType: serviceType;
  movingDate: string; // YYYY-MM-DD 형식
  departure: string;
  arrival: string;
  createdAt: Date; // DateTime 형식
};

// 무작위 날짜 생성 함수
function generateRandomDate(): Date {
  const start = new Date('2024-08-01');
  const end = new Date('2024-12-03');
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date; // Date 객체 반환
}

// movingDate를 createdAt의 43일 이후로 설정하는 함수
function calculateMovingDate(createdAt: Date): string {
  const movingDate = new Date(createdAt);
  movingDate.setDate(movingDate.getDate() + 43); // 43일 추가
  return movingDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식 반환
}

// 데이터 생성
function generateMovingInfo(count: number): MovingInfoData[] {
  const movingInfoList: MovingInfoData[] = [];
  
  for (let i = 0; i < count; i++) {
    const createdAt = generateRandomDate(); // 생성 시간
    const movingDate = calculateMovingDate(createdAt); // 43일 이후 날짜

    movingInfoList.push({
      movingType: getServiceTypes() as serviceType, // 서비스 타입 생성
      movingDate, // YYYY-MM-DD 형식
      departure: getRandomAddress(), // 출발지 주소 생성
      arrival: getRandomAddress(), // 도착지 주소 생성
      createdAt, // DateTime 형식
    });
  }

  return movingInfoList;
}

// 데이터 저장 함수
function saveDataToJsonFile(data: any, filePath: string): void {
  // createdAt은 ISO 형식, movingDate는 YYYY-MM-DD 형식 유지
  const jsonData = data.map((item: MovingInfoData) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));
  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
}

// 데이터 생성 및 저장
(() => {
  const movingInfoList = generateMovingInfo(movingInfoCount);

  saveDataToJsonFile(movingInfoList, './data/movingInfo.json');

  console.log(`${movingInfoCount}개의 MovingInfo 데이터가 movingInfo.json에 저장되었습니다.`);
})();
