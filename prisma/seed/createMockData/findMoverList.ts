import fs from "fs";
import path from "path";

type MoverInfo = {
  id: string;
  userId: string;
  profileImage: string;
  nickname: string;
  career: number;
  summary: string;
  description: string;
  serviceType: string;
  serviceRegion: string;
  reviewStats: {
    averageScore: number;
    totalReviews: number;
  };
};

// 모든 Mover 정보를 가져오는 함수
function getAllMoverInfo(moverBasePath: string): MoverInfo[] {
  if (!fs.existsSync(moverBasePath)) {
    console.error(`Base path not found: ${moverBasePath}`);
    return [];
  }

  const moverDirectories = fs
    .readdirSync(moverBasePath)
    .filter((dir) => dir.startsWith("moverProfile"));

  const movers: MoverInfo[] = [];

  moverDirectories.forEach((dirName) => {
    const detailPath = path.join(moverBasePath, dirName, "moverDetail.json");

    if (fs.existsSync(detailPath)) {
      try {
        const moverDetail = JSON.parse(fs.readFileSync(detailPath, "utf-8"));

        movers.push({
          id: moverDetail.id || "N/A",
          userId: moverDetail.userId || "N/A",
          profileImage: moverDetail.profileImage || "",
          nickname: moverDetail.nickname || "Unknown",
          career: moverDetail.career || 0,
          summary: moverDetail.summary || "",
          description: moverDetail.description || "",
          serviceType: moverDetail.serviceType?.join(", ") || "N/A",
          serviceRegion: moverDetail.serviceRegion?.join(", ") || "N/A",
          reviewStats: {
            averageScore: moverDetail.reviewStats?.averageScore || 0,
            totalReviews: moverDetail.reviewStats?.totalReviews || 0,
          },
        });
      } catch (error) {
        console.error(`Error parsing moverDetail.json in ${dirName}:`, error);
      }
    } else {
      console.warn(`moverDetail.json not found in: ${dirName}`);
    }
  });

  return movers;
}

// JSON 파일로 저장 함수
function saveMoverInfoToFile(fileName: string, data: MoverInfo[]): void {
  const directory = path.resolve(__dirname, "result", "mover"); // 결과 저장 디렉터리
  const filePath = path.join(directory, fileName);

  fs.mkdirSync(directory, { recursive: true });

  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, "utf-8");
  console.log(`findMoverList.json saved to ${filePath}`);
}

// 실행
const moverBasePath = path.resolve(__dirname, "result", "user");
const allMoverInfo = getAllMoverInfo(moverBasePath);
saveMoverInfoToFile("findMoverList.json", allMoverInfo);
