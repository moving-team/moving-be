import fs from "fs";
import path from "path";
import { generateName } from "../generate/generateName";
import { getRecentRandomDate } from "../generate/generateDate";
import { getRandomReview } from "../generate/generateReview";

const createCount = 20;

type Review = {
  id: number;
  writer: string;
  createAt: string;
  score: number;
  content: string;
};

type ReviewData = {
  total: number;
  list: Review[];
};

function getWeightedScore(): number {
  const weightedScores = [1, 2, 3, 4, 4, 4, 5, 5, 5, 5]; // 점수 가중
  return weightedScores[Math.floor(Math.random() * weightedScores.length)];
}

// Mock 데이터 생성 함수
function generateReviewData(count: number): ReviewData {
  const list: Review[] = [];

  for (let i = 1; i <= count; i++) {
    list.push({
      id: i,
      writer: generateName(),
      createAt: getRecentRandomDate(),
      score: getWeightedScore(), // 1~5 범위의 별점
      content: getRandomReview(),
    });
  }

  return {
    total: list.length,
    list,
  };
}

// JSON 파일로 저장 함수
function saveMockDataToFile(fileName: string, data: ReviewData): void {
  const directory = path.resolve(__dirname, "result"); // 'result' 디렉터리 경로 설정
  const filePath = path.join(directory, fileName); // 디렉터리 + 파일명 조합

  // 디렉터리 생성 (이미 존재하면 무시)
  fs.mkdirSync(directory, { recursive: true });

  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, "utf-8");
  console.log(`Mock data saved to ${filePath}`);
}

// 실행
const reviewData = generateReviewData(createCount); // 리뷰 20개 생성
saveMockDataToFile("reviewListData.json", reviewData);
