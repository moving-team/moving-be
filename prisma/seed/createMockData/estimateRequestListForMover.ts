// 미완

import fs from "fs";
import path from "path";
import { getServiceTypes } from '../generate/getServiceType';
import { getRandomAddress } from "../generate/getAddress";
import { generateName } from "../generate/getName";

const createCount = 20;

// 타입 정의
type EstimateRequest = {
  id: number;
  name: string;
  movingType: string
  movingDate: string;
  departure: string;
  arrival: string;
  comment: string;
  isAssigned: boolean;
  createAt: string;
};

type EstimateRequestData = {
  total: number;
  small: number;
  medium: number;
  large: number;
  assign: number;
  list: EstimateRequest[];
};

// 랜덤 데이터 생성 함수
function getRandomDate(): string[] {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 30); // 최대 30일 후

  // 랜덤 날짜 생성
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const randomDate2 = new Date(randomDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const result = [
    randomDate.toISOString().split("T")[0].replace(/-/g, ". "), // YYYY-MM-DD
    randomDate2.toISOString().split("T")[0].replace(/-/g, ". "), // 3일 뒤 날짜
  ];
  return result;
}

function getRandomComment(): string {
  const comments = [
    "짐이 적어서 소형 트럭이면 충분합니다.",
    "엘리베이터 사용 가능 여부 확인 부탁드립니다.",
    "짐이 많아서 대형 트럭 필요합니다.",
    "출발지와 도착지 모두 주차 공간 확보가 필요합니다.",
    "이사 날짜를 변경할 수 있는 유연성이 필요합니다.",
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

// 목데이터 생성 함수
function generateEstimateRequestData(count: number): EstimateRequestData {
  const list: EstimateRequest[] = [];
  let smallCount = 0;
  let mediumCount = 0;
  let largeCount = 0;
  let assignedCount = 0;

  for (let i = 1; i <= count; i++) {
    const movingType = getServiceTypes();
    const isAssigned = Math.random() < 0.25; // 25% 확률로 true/false
    const dateList = getRandomDate();
    const createAt = dateList[0];
    const movingDate = dateList[1];

    console.log(dateList)

    // 카운트 업데이트
    if (movingType === "SMALL") smallCount++;
    else if (movingType === "HOUSE") mediumCount++;
    else if (movingType === "OFFICE") largeCount++;
    if (isAssigned) assignedCount++;

    list.push({
      id: i,
      name: generateName(),
      movingType,
      movingDate,
      departure: getRandomAddress(),
      arrival: getRandomAddress(),
      comment: getRandomComment(),
      isAssigned,
      createAt
    });
  }

  return {
    total: list.length,
    small: smallCount,
    medium: mediumCount,
    large: largeCount,
    assign: assignedCount,
    list,
  };
}

// JSON 파일로 저장 함수
function saveMockDataToFile(fileName: string, data: object): void {
  const directory = path.resolve(__dirname, "result");
  const filePath = path.join(directory, fileName);

  // 디렉터리 생성
  fs.mkdirSync(directory, { recursive: true });

  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, "utf-8");
  console.log(`Mock data saved to ${filePath}`);
}

// 실행
const estimateRequestData = generateEstimateRequestData(createCount); // 20개의 데이터 생성
saveMockDataToFile("estimateRequestData.json", estimateRequestData);