import fs from "fs";
import path from "path";
import { generateName } from "../generate/generateName";
import { getRecentRandomDate } from "../generate/generateDate";
import { getRandomReview } from "../generate/generateReview";

const createCount = 100;

type Review = {
  id: number;
  writer: string;
  createAt: string;
  score: number;
  content: string;
};

type ReviewData = {
  reviewCount: { [key: number]: number };
  list: Review[];
};

function getWeightedScore(): number {
  const weightedScores = [1, 2, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5]; // 점수 가중
  return weightedScores[Math.floor(Math.random() * weightedScores.length)];
}

// 데이터 생성
function generateReviewData(count: number): ReviewData {
  const list: Review[] = [];
  const reviewCount: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (let i = 1; i <= count; i++) {
    const score = getWeightedScore();
    reviewCount[score] += 1;

    list.push({
      id: i,
      writer: generateName(),
      createAt: getRecentRandomDate(),
      score,
      content: getRandomReview(),
    });
  }

  return {
    reviewCount,
    list,
  };
}

// JSON 파일로 저장 함수
function saveMockDataToFile(directory: string, data: ReviewData): void {
  const filePath = path.join(directory, "reviewList.json");

  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, "utf-8");
  console.log(`Mock data saved to ${filePath}`);
}

// moverProfile{n} 디렉터리 처리 함수
function generateReviewsForAllMoverProfiles(basePath: string, count: number): void {
  const moverDirectories = fs
    .readdirSync(basePath)
    .filter((dir) => dir.startsWith("moverProfile"));

  moverDirectories.forEach((dirName) => {
    const moverDirPath = path.join(basePath, dirName);

    if (fs.existsSync(moverDirPath)) {
      const reviewData = generateReviewData(count);
      saveMockDataToFile(moverDirPath, reviewData);
    } else {
      console.log(`moverProfile directory not found: ${dirName}`);
    }
  });
}

// 실행 경로
const basePath = path.resolve(__dirname, "result", "user");
generateReviewsForAllMoverProfiles(basePath, createCount);
