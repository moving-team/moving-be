import fs from "fs";
import path from "path";
import { getRegionArray } from "../generate/generateRegion";
import { getServiceTypesArray } from "../generate/generateServiceType";

const ReviewTotalCount = 100;

// 프로필 데이터 읽기 함수
function readProfileData(profilePath: string): Record<string, any> {
  const data = fs.readFileSync(profilePath, "utf-8");
  return JSON.parse(data);
}

// moverDetail.json 생성 및 저장 함수
function generateAndSaveDetail(profilePath: string): void {
  const profileData = readProfileData(profilePath);

  // moverDetail.json 데이터 생성
  const detailData = {
    id: profileData.id,
    userId: profileData.userId,
    profileImage: "",
    nickname: "",
    career: Math.floor(Math.random() * 30) + 1,
    summary: "",
    description: "",
    confirmationCount: Math.floor(Math.random() * 200) + 1,
    serviceType: getServiceTypesArray(),
    serviceRegion: getRegionArray(),
    reviewStats: {
      averageScore: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
      totalReviews: ReviewTotalCount,
    },
    favorite: Math.floor(Math.random() * 100) + 1,
    isAssigned: Math.random() < 0.25,

  };

  // moverDetail.json 저장 경로 설정
  const directory = path.dirname(profilePath);
  const detailPath = path.join(directory, "moverDetail.json");

  // 파일 저장
  fs.writeFileSync(detailPath, JSON.stringify(detailData, null, 2), "utf-8");
  console.log(`Detail saved to ${detailPath}`);
}

// result/user 디렉터리 내 모든 moverProfile 디렉터리 처리
function processMoverProfiles(basePath: string): void {
  const directories = fs.readdirSync(basePath);

  directories.forEach((dirName) => {
    // moverProfile 디렉터리만 처리
    if (!dirName.startsWith("moverProfile")) {
      console.log(`Skipping directory: ${dirName}`);
      return;
    }

    const profilePath = path.join(basePath, dirName, "profile.json");
    if (fs.existsSync(profilePath)) {
      generateAndSaveDetail(profilePath);
    } else {
      console.log(`profile.json not found in ${dirName}`);
    }
  });
}

// 실행
const basePath = path.resolve(__dirname, "result", "user"); // result/user 디렉터리 경로
processMoverProfiles(basePath);
