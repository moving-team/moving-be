import fs from "fs";
import { getServiceTypes, getServiceTypesArray } from "../generate/generateServiceType";
import { getRegion, getRegionArray } from "../generate/generateRegion";

const createCount = 100;

type CustomerProfile = {
  id: number;
  userId: number;
  profileImage: string;
  serviceType: string;
  region: string;
};

type MoverProfile = {
  id: number;
  userId: number;
  profileImage: string;
  nickname: string;
  career: number;
  summary: string;
  description: string;
  serviceType: Array<string>;
  serviceRegion: Array<string>;
  name: string;
};

// 랜덤 문자열 생성 함수
function getRandomString(prefix: string, length: number): string {
  return `${prefix}${Math.random().toString(36).substring(2, 2 + length)}`;
}

// ID 추적을 위한 Set
const usedIds = new Set<number>();

// 유일한 ID 생성 함수
function generateUniqueId(): number {
  let id: number;
  do {
    id = Math.floor(Math.random() * createCount * 2); 
  } while (usedIds.has(id));
  usedIds.add(id); 
  return id;
}


// Mock 데이터 생성 함수 (CustomerProfile)
function generateCustomerProfiles(count: number): CustomerProfile[] {
  const customerProfiles: CustomerProfile[] = [];

  for (let i = 1; i <= count; i++) {
    const id = generateUniqueId();
    customerProfiles.push({
      id: id,
      userId: generateUniqueId(),
      profileImage: "",
      serviceType: getServiceTypes(), 
      region: getRegion(),
    });
  }

  return customerProfiles;
}

// Mock 데이터 생성 함수 (MoverProfile)
function generateMoverProfiles(count: number): MoverProfile[] {
  const moverProfiles: MoverProfile[] = [];

  for (let i = 1; i <= count; i++) {
    const id = generateUniqueId();
    moverProfiles.push({
      id: id,
      userId: generateUniqueId(),
      profileImage: "",
      nickname: getRandomString("nickname_", 5),
      career: Math.floor(Math.random() * 30) + 1,
      summary: "Experienced mover ready to assist!",
      description: "I provide high-quality moving services tailored to your needs.",
      serviceType: getServiceTypesArray(),
      serviceRegion: getRegionArray(),
      name: `Mover ${i}`,
    });
  }

  return moverProfiles;
}

// JSON 파일로 저장 함수
function saveMockDataToFile(fileName: string, data: object[]): void {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(fileName, jsonData, "utf-8");
  console.log(`Mock data saved to ${fileName}`);
}

// 실행
const customerProfiles = generateCustomerProfiles(createCount); 
const moverProfiles = generateMoverProfiles(createCount); 

saveMockDataToFile("customerProfile.json", customerProfiles);
saveMockDataToFile("moverProfile.json", moverProfiles);
