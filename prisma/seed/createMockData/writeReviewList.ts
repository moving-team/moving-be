import fs from "fs";
import path from "path";
import { generateName } from "../generate/generateName"; // Mover 이름 생성
import { getServiceTypes } from "../generate/generateServiceType"; // 서비스 타입 생성

type WriteReview = {
  serviceType: string;
  isAssigned: boolean;
  createAt: string;
  id: number;
  moverName: string;
  profileImg: string;
  movingDate: string;
  price: number;
  score: number;
  content: string;
};

type WriteReviewData = {
  total: number;
  list: WriteReview[];
};

// 랜덤 숫자 생성 함수
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 랜덤한 리뷰 내용 생성
function getRandomReview(): string {
  const reviews = [
    "정말 친절하고 좋은 서비스였습니다!",
    "다소 아쉬운 점도 있었지만 전체적으로 만족합니다.",
    "신속하고 깔끔한 이사였습니다.",
    "가격 대비 좋은 서비스였습니다.",
    "다음에 또 이용하고 싶어요!",
  ];
  return reviews[getRandomNumber(0, reviews.length - 1)];
}

// 랜덤 날짜 생성 함수
function getRandomDate(): [string, string] {
  const today = new Date();
  const createAt = new Date(
    today.getTime() - getRandomNumber(1, 365) * 24 * 60 * 60 * 1000
  );
  const movingDate = new Date(
    createAt.getTime() - getRandomNumber(1, 30) * 24 * 60 * 60 * 1000
  );

  return [
    createAt.toISOString().split("T")[0].replace(/-/g, ". "),
    movingDate.toISOString().split("T")[0].replace(/-/g, ". "),
  ];
}

// 리뷰 데이터 생성 함수
function generateWriteReviewData(
  moverNames: string[],
  count: number
): WriteReviewData {
  const list: WriteReview[] = [];

  for (let i = 1; i <= count; i++) {
    const [createAt, movingDate] = getRandomDate();

    list.push({
      serviceType: getServiceTypes(),
      isAssigned: Math.random() < 0.25,
      createAt,
      id: i,
      moverName: moverNames[getRandomNumber(0, moverNames.length - 1)],
      profileImg: "", // 예시 이미지 URL
      movingDate,
      price: getRandomNumber(10, 100) * 10000,
      score: getRandomNumber(3, 5),
      content: getRandomReview(),
    });
  }

  return {
    total: list.length,
    list,
  };
}

// JSON 파일로 저장 함수
function saveWriteReviewListToFile(directory: string, data: WriteReviewData): void {
  const filePath = path.join(directory, "writeReviewList.json");
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, "utf-8");
  console.log(`writeReviewList.json saved to ${filePath}`);
}

// customerProfile{n} 디렉터리 처리 함수
function generateWriteReviewListForCustomerProfiles(
  customerBasePath: string,
  moverNames: string[]
): void {
  if (!fs.existsSync(customerBasePath)) {
    console.error(`Base path not found: ${customerBasePath}`);
    return;
  }

  const customerDirectories = fs
    .readdirSync(customerBasePath)
    .filter((dir) => dir.startsWith("customerProfile"));

  if (customerDirectories.length === 0) {
    console.warn("No customerProfile directories found!");
    return;
  }

  customerDirectories.forEach((dirName) => {
    const customerDirPath = path.join(customerBasePath, dirName);
    if (fs.existsSync(customerDirPath)) {
      const randomReviewCount = getRandomNumber(1, 15);
      const writeReviewData = generateWriteReviewData(
        moverNames,
        randomReviewCount
      );
      saveWriteReviewListToFile(customerDirPath, writeReviewData);
    } else {
      console.warn(`Directory not found: ${customerDirPath}`);
    }
  });
}

// 실행 경로
const customerBasePath = path.resolve(__dirname, "result", "user");
const moverBasePath = path.resolve(__dirname, "result", "user");

console.log(`Reading mover names from: ${moverBasePath}`);
const moverNames = fs
  .readdirSync(moverBasePath)
  .filter((dir) => dir.startsWith("moverProfile"))
  .map((dirName) => {
    const detailPath = path.join(moverBasePath, dirName, "moverDetail.json");
    if (fs.existsSync(detailPath)) {
      const moverDetail = JSON.parse(fs.readFileSync(detailPath, "utf-8"));
      return moverDetail.nickname || generateName();
    }
    console.warn(`moverDetail.json not found in: ${dirName}`);
    return generateName();
  });

if (moverNames.length === 0) {
  console.error("No mover names found. Aborting operation.");
} else {
  console.log(`Found mover names: ${moverNames}`);
  generateWriteReviewListForCustomerProfiles(customerBasePath, moverNames);
}
