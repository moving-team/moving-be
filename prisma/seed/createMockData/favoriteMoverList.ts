import fs from 'fs';
import path from 'path';
import { getServiceTypesArray } from '../generate/generateServiceType';

const createCount = 20;

// 데이터 타입 정의
type favoriteMover = {
  serviceType: string[];
  nickname: string;
  score: number;
  reviewCount: number;
  career: number;
  confirmationCount: number;
  favoriteCount: number;
};

type favoriteMoverListData = {
  total: number;
  list: favoriteMover[];
};

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Mock 데이터 생성 함수
function generateMockData(count: number): favoriteMoverListData {
  const list: favoriteMover[] = [];

  for (let i = 0; i < count; i++) {
    list.push({
      serviceType: getServiceTypesArray(),
      nickname: '',
      score: parseFloat((Math.random() * 5).toFixed(1)), // 0.0 ~ 5.0 평점
      reviewCount: getRandomNumber(10, 500), // 10 ~ 500 리뷰 갯수
      career: Math.floor(Math.random() * 30) + 1,
      confirmationCount: getRandomNumber(5, 200), // 5 ~ 200 견적 확정
      favoriteCount: getRandomNumber(0, 1000), // 0 ~ 1000 찜 갯수
    });
  }

  return {
    total: list.length,
    list,
  };
}

// // JSON 파일로 저장 함수
function saveMockDataToFile(fileName: string, data: favoriteMoverListData): void {
  const directory = path.resolve(__dirname, "result"); 
  const filePath = path.join(directory, fileName); 

  fs.mkdirSync(directory, { recursive: true });

  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, "utf-8");
  console.log(`Mock data saved to ${fileName}`);
}

// 실행
const serviceData = generateMockData(createCount);
saveMockDataToFile('serviceData.json', serviceData);
