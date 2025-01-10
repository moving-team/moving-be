import { serviceType, serviceRegion, PrismaClient } from '@prisma/client';
import { moverList } from '../dummyList/crawlingMoverList';
import { generateName } from '../generate/getName';
import { generateUniquePhoneNumber } from '../generate/getNumber';
import { getRegion, getRegionArray } from '../generate/getRegion';
import { getWeightedServiceTypesArray, getServiceTypesArray } from '../generate/getServiceType';
import * as fs from 'fs';
import path from 'path';
import * as bcrypt from 'bcrypt'; // bcrypt 추가
import * as dotenv from 'dotenv'; // dotenv 추가
import { is } from 'superstruct';

dotenv.config(); // .env 파일 로드

const prisma = new PrismaClient();
const saltRounds = 10; 
const commonPassword = process.env.COMMON_PASSWORD || 'defaultPassword'; 



export type UserData = {
  userType: 'MOVER' | 'CUSTOMER';
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  password: string;
};


type MoverData = {
  userId: number;
  nickname: string;
  summary: string;
  description: string;
  serviceRegion: serviceRegion[];
  serviceType: serviceType[];
  career: number;
  confirmationCount: number;
};

type CustomerData = {
  userId: number;
  region: serviceRegion;
  serviceType: serviceType[];
};

// 날짜 생성
function getBeforeDate(): Date {
  const startDate = new Date('2021-01-01T00:00:00');
  const endDate = new Date('2022-12-31T23:59:59');
  if (startDate >= endDate) {
    throw new Error('startDate must be earlier than endDate');
  }

  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  const randomTimestamp = Math.floor(
    Math.random() * (endTimestamp - startTimestamp + 1) + startTimestamp
  );

  return new Date(randomTimestamp);
}

// 데이터 생성
async function generateUsers(isTest: boolean = false): Promise<{
  users: UserData[];
  movers: MoverData[];
  customers: CustomerData[];
}> {
  // 테스트 수량 지정
  let moverCount = 0;
  let customerCount = 0;

  if (isTest) {
    moverCount = 50;
    customerCount = 150;
  } else {
    moverCount = 300;
    customerCount = 1500;
  }

  const users: UserData[] = [];
  const movers: MoverData[] = [];
  const customers: CustomerData[] = [];
  const usedUserIds = new Set<number>(); // 사용된 userId 추적
  const hashedPassword = await bcrypt.hash(commonPassword, saltRounds);

  // 데이터베이스에서 가장 큰 userId 체크
  const maxUserId = (await prisma.user.findMany({
    select: { id: true },
    orderBy: { id: 'desc' },
    take: 1,
  }))[0]?.id || 0;
  let userId = maxUserId + 1; 

  // 무작위 moverList 선택
  const selectedMovers = [...moverList]
    .sort(() => Math.random() - 0.5)
    .slice(0, moverCount);

  // Generate Movers
  selectedMovers.forEach((moverData) => {
    while (usedUserIds.has(userId)) {
      userId++; // 이미 사용된 ID라면 다음 ID로 증가
    }
    usedUserIds.add(userId); // 사용된 ID 추가

    users.push({
      userType: 'MOVER',
      name: generateName(),
      email: `m${userId}@test.com`,
      phoneNumber: generateUniquePhoneNumber(),
      createdAt: getBeforeDate(),
      password: hashedPassword, 
    });

    movers.push({
      userId, 
      nickname: moverData.name,
      summary: moverData.introduction,
      description: moverData.description,
      serviceRegion: getRegionArray() as serviceRegion[],
      serviceType: getServiceTypesArray() as serviceType[],
      career: Math.floor(Math.random() * 30) + 1,
      confirmationCount: 0,
    });

    userId++;
  });

  // Generate Customers
  for (let i = 0; i < customerCount; i++) {
    while (usedUserIds.has(userId)) {
      userId++; 
    }
    usedUserIds.add(userId); 

    users.push({
      userType: 'CUSTOMER',
      name: generateName(),
      email: `c${userId}@test.com`,
      phoneNumber: generateUniquePhoneNumber(),
      createdAt: getBeforeDate(),
      password: hashedPassword, 
    });

    customers.push({
      userId, 
      region: getRegion() as serviceRegion,
      serviceType: getWeightedServiceTypesArray() as serviceType[],
    });

    userId++;
  }

  return { users, movers, customers };
}


function saveDataToJsonFile(data: any, filePath: string): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


const EXPORT_PATH_USER = path.join(__dirname, './data/users.json');
const EXPORT_PATH_MOVER = path.join(__dirname, './data/movers.json');
const EXPORT_PATH_CUSTOMERS = path.join(__dirname, './data/customers.json');


// 데이터 생성 및 저장
export async function createUser(isTest: boolean = false): Promise<void> {
  const { users, movers, customers } = await generateUsers(isTest);
  saveDataToJsonFile(users, EXPORT_PATH_USER);
  saveDataToJsonFile(movers, EXPORT_PATH_MOVER);
  saveDataToJsonFile(customers, EXPORT_PATH_CUSTOMERS);

  console.log('데이터가 각각 users.json, movers.json, customers.json에 저장되었습니다.');
  await prisma.$disconnect();
}

async function main() {
  const { users, movers, customers } = await generateUsers();
  saveDataToJsonFile(users, './data/users.json');
  saveDataToJsonFile(movers, './data/movers.json');
  saveDataToJsonFile(customers, './data/customers.json');

  console.log('데이터가 각각 users.json, movers.json, customers.json에 저장되었습니다.');
  await prisma.$disconnect();
}

if (require.main === module) {
  main()
} 