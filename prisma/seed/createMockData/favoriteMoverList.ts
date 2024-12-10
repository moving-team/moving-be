import fs from "fs";
import path from "path";

// 데이터 타입 정의
type FavoriteMover = {
  serviceType: string[];
  isAssigned: boolean;
  nickname: string;
  profileImg: string;
  comment: string;
  score: number;
  reviewCount: number;
  career: number;
  confirmationCount: number;
  favoriteCount: number;
};

type FavoriteMoverListData = {
  total: number;
  list: FavoriteMover[];
};

// 랜덤 숫자 생성 함수
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// moverDetail.json 읽기 함수
function readMoverDetail(detailPath: string): Record<string, any> {
  const data = fs.readFileSync(detailPath, "utf-8");
  return JSON.parse(data);
}

// favoriteMoverList.json 생성 함수
function generateFavoriteMoverList(
  moverBasePath: string,
  randomListSize: number
): FavoriteMoverListData {
  const list: FavoriteMover[] = [];
  const moverDirectories = fs
    .readdirSync(moverBasePath)
    .filter((dir) => dir.startsWith("moverProfile"));

  moverDirectories.slice(0, randomListSize).forEach((dirName) => {
    const detailPath = path.join(moverBasePath, dirName, "moverDetail.json");

    if (fs.existsSync(detailPath)) {
      const moverDetail = readMoverDetail(detailPath);

      list.push({
        serviceType: moverDetail.serviceType || [],
        isAssigned: Math.random() < 0.25, // 랜덤 true/false
        nickname: moverDetail.nickname || "",
        profileImg: moverDetail.profileImage || "",
        comment: moverDetail.summary || "", // summary를 comment로 사용
        score: moverDetail.reviewStats?.averageScore || 0, // 평균 평점
        reviewCount: moverDetail.reviewStats?.totalReviews || 0, // 리뷰 갯수
        career: moverDetail.career || 0,
        confirmationCount: moverDetail.confirmationCount || 0,
        favoriteCount: moverDetail.favorite || 0,
      });
    }
  });

  return {
    total: list.length,
    list,
  };
}

// favoriteMoverList.json 저장 함수
function saveFavoriteMoverListToFile(
  directory: string,
  data: FavoriteMoverListData
): void {
  const filePath = path.join(directory, "favoriteMoverList.json");

  fs.mkdirSync(directory, { recursive: true });

  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, "utf-8");
  console.log(`FavoriteMoverList saved to ${filePath}`);
}

// customerProfile 디렉터리 처리 함수
function processCustomerProfiles(
  moverBasePath: string,
  userBasePath: string
): void {
  // userBasePath에서 customerProfile{n} 디렉터리만 필터링
  const customerDirectories = fs
    .readdirSync(userBasePath)
    .filter((dir) => dir.startsWith("customerProfile"));

  customerDirectories.forEach((dirName) => {
    const customerDirPath = path.join(userBasePath, dirName);

    if (fs.existsSync(customerDirPath)) {
      // 랜덤 리스트 크기 (1~10)
      const randomListSize = getRandomNumber(1, 25);
      const favoriteMoverList = generateFavoriteMoverList(
        moverBasePath,
        randomListSize
      );
      saveFavoriteMoverListToFile(customerDirPath, favoriteMoverList);
    } else {
      console.log(`customerProfile directory not found: ${dirName}`);
    }
  });
}

// 실행 경로
const moverBasePath = path.resolve(__dirname, "result", "user");
const customerBasePath = path.resolve(__dirname, "result", "user");

// Process customer profiles
processCustomerProfiles(moverBasePath, customerBasePath);
