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

  // profile.json 데이터를 활용하여 moverDetail.json 데이터 생성
  const detailData = {
    id: profileData.id, // profile.json에서 가져옴
    userId: profileData.userId, // profile.json에서 가져옴
    profileImage: profileData.profileImage || "", // profile.json에서 가져오거나 기본값
    nickname: profileData.nickname || "", // profile.json에서 가져오거나 기본값
    career: profileData.career || Math.floor(Math.random() * 30) + 1, // profile.json에서 가져오거나 랜덤 생성
    summary: profileData.summary || "", // profile.json에서 가져오거나 기본값
    description: profileData.description || "", // profile.json에서 가져오거나 기본값
    confirmationCount: Math.floor(Math.random() * 200) + 1, // 랜덤 생성
    serviceType: profileData.serviceType || getServiceTypesArray(), // profile.json에서 가져오거나 랜덤 생성
    serviceRegion: profileData.serviceRegion || getRegionArray(), // profile.json에서 가져오거나 랜덤 생성
    reviewStats: {
      averageScore: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)), // 랜덤 생성
      totalReviews: ReviewTotalCount,
    },
    favorite: Math.floor(Math.random() * 100) + 1, // 랜덤 생성
    isAssigned: Math.random() < 0.25, // 랜덤 생성
    User: {
      name: profileData.User?.name || "", // profile.json에서 User의 이름 가져옴
    },
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
