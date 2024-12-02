import fs from "fs";
import path from "path";
import {
  getServiceTypes,
  getServiceTypesArray,
} from "../generate/generateServiceType";
import { getRegion, getRegionArray } from "../generate/generateRegion";
import { generateName } from "../generate/generateName";

// 생성할 개수 설정
const createCount = 25; // Mover와 Customer 각각 25명씩

type CustomerProfile = {
  id: number;
  userId: number;
  profileImage: string;
  serviceType: string;
  region: string;
  User: {
    name: string;
  };
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
  User: {
    name: string;
  };
};

// 랜덤 문자열 생성 함수
function getRandomString(prefix: string, length: number): string {
  return `${prefix}${Math.random().toString(36).substring(2, 2 + length)}`;
}

// ID 생성 함수
function generateId(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 디렉터리 생성 함수
function createDirectory(basePath: string, dirName: string): string {
  const dirPath = path.join(basePath, dirName);
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

// 파일 저장 함수
function saveDataToFile(directory: string, fileName: string, data: object): void {
  const filePath = path.join(directory, fileName);
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, "utf-8");
  console.log(`Data saved to ${filePath}`);
}

// CustomerProfile 생성
function generateCustomerProfiles(basePath: string, count: number): void {
  for (let i = 1; i <= count; i++) {
    const profile = {
      id: generateId(26, 50), // Customer ID: 26~50
      userId: generateId(26, 50), // User ID: 26~50
      profileImage: "",
      serviceType: getServiceTypes(),
      region: getRegion(),
      User: {
        name: generateName(),
      },
    };

    const dirName = `customerProfile${i}`; // e.g., customerProfile1
    const directory = createDirectory(basePath, dirName);
    saveDataToFile(directory, "profile.json", profile);
  }
}

// MoverProfile 생성
function generateMoverProfiles(basePath: string, count: number): void {
  for (let i = 1; i <= count; i++) {
    const profile = {
      id: generateId(1, 25), // Mover ID: 1~25
      userId: generateId(1, 25), // User ID: 1~25
      profileImage: "",
      nickname: getRandomString("nickname_", 5),
      career: Math.floor(Math.random() * 30) + 1,
      summary: "Experienced mover ready to assist!",
      description:
        "I provide high-quality moving services tailored to your needs.",
      serviceType: getServiceTypesArray(),
      serviceRegion: getRegionArray(),
      User: {
        name: generateName(),
      },
    };

    const dirName = `moverProfile${i}`; // e.g., moverProfile1
    const directory = createDirectory(basePath, dirName);
    saveDataToFile(directory, "profile.json", profile);
  }
}

// 실행
const basePath = path.resolve(__dirname, "result", "user"); // result/user 폴더 경로
fs.mkdirSync(basePath, { recursive: true }); // result/user 디렉터리 생성

generateMoverProfiles(basePath, createCount); // Mover Profiles 생성
generateCustomerProfiles(basePath, createCount); // Customer Profiles 생성

