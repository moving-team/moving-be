import { serviceType, serviceRegion, PrismaClient } from '@prisma/client';
import { moverList } from '../dummyList/crawlingMoverList';
import { generateName } from '../generate/getName';
import { generateUniquePhoneNumber } from '../generate/getNumber';
import { getRegion, getRegionArray } from '../generate/getRegion';
import { getWeightedServiceTypesArray, getServiceTypesArray } from '../generate/getServiceType';
import { getBeforeDate } from '../generate/getDate';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt'; // bcrypt 추가
import * as dotenv from 'dotenv'; // dotenv 추가

dotenv.config(); // .env 파일 로드

const prisma = new PrismaClient();
const saltRounds = 10; // bcrypt saltRounds 설정
const commonPassword = process.env.COMMON_PASSWORD || 'defaultPassword'; // COMMON_PASSWORD 가져오기

const moverCount = 500; // 생성할 Mover 수
const customerCount = moverCount * 2; // Customer 수 = Mover의 3배

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

// 데이터 생성
async function generateUsers(): Promise<{
  users: UserData[];
  movers: MoverData[];
  customers: CustomerData[];
}> {
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

// 데이터 생성 및 저장
(async () => {
  const { users, movers, customers } = await generateUsers();
  saveDataToJsonFile(users, './data/users.json');
  saveDataToJsonFile(movers, './data/movers.json');
  saveDataToJsonFile(customers, './data/customers.json');

  console.log('데이터가 각각 users.json, movers.json, customers.json에 저장되었습니다.');
  await prisma.$disconnect();
})();
