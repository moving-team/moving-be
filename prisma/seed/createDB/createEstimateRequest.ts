import { prisma } from '../helper/helperDB';
import fs from 'fs/promises';
import path from 'path';
import { getRandomComment } from '../generate/getReqComment';

const BATCH_SIZE = 100;

// MovingInfo 데이터 타입
type MovingInfo = {
  id: number;
  movingDate: Date;
  createdAt: Date;
};

// Customer 데이터 타입
type Customer = {
  id: number;
};

// EstimateRequest 데이터 타입
type EstimateRequest = {
  customerId: number;
  movingInfoId: number;
  comment: string;
  isConfirmed: boolean;
  isCancelled: boolean;
  createdAt: Date;
};

// 랜덤 정수 생성
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 기존 고객 중 임의의 고객 선택
function getRandomCustomerId(customerIds: number[]): number {
  const randomIndex = Math.floor(Math.random() * customerIds.length);
  return customerIds[randomIndex];
}

// EstimateRequest 생성 로직
function generateEstimateRequestsBatch(
  movingInfoBatch: MovingInfo[],
  customerIds: number[],
  customerEstimateLimits: Map<number, number>,
  today: Date
): EstimateRequest[] {
  const estimateRequests: EstimateRequest[] = [];

  for (const movingInfo of movingInfoBatch) {
    let customerId = getRandomCustomerId(customerIds);

    while (true) {
      const currentRequestCount = estimateRequests.filter(
        (req) => req.customerId === customerId
      ).length;

      if (currentRequestCount < (customerEstimateLimits.get(customerId) || 0)) {
        break;
      }

      customerId = getRandomCustomerId(customerIds);
    }

    const isFuture = movingInfo.movingDate > today;
    const isConfirmed = isFuture
      ? Math.random() <= 0.2
      : Math.random() <= 0.97;
    const isCancelled = !isConfirmed && Math.random() <= 0.2;

    estimateRequests.push({
      customerId,
      movingInfoId: movingInfo.id,
      comment: getRandomComment(),
      isConfirmed,
      isCancelled,
      createdAt: movingInfo.createdAt,
    });
  }

  return estimateRequests;
}

// 전체 EstimateRequest 생성
export async function createEstimateRequest(): Promise<void> {
  try {
    console.log('Start generating EstimateRequest data...');

    const movingInfoData: MovingInfo[] = await prisma.movingInfo.findMany({
      select: { id: true, movingDate: true, createdAt: true },
    });

    const customers: Customer[] = await prisma.customer.findMany({
      select: { id: true },
    });
    const customerIds = customers.map((customer) => customer.id);

    if (movingInfoData.length === 0 || customerIds.length === 0) {
      throw new Error('No MovingInfo or Customer data found in the database.');
    }

    const customerEstimateLimits: Map<number, number> = new Map();
    customerIds.forEach((id) =>
      customerEstimateLimits.set(id, getRandomInt(1, 20))
    );

    const today = new Date();
    const totalBatches = Math.ceil(movingInfoData.length / BATCH_SIZE);

    console.log(`Total batches: ${totalBatches}`);

    const filePath = path.join(__dirname, './data/estimateRequest.json');
    await fs.mkdir(path.dirname(filePath), { recursive: true }); // 폴더 생성
    const writeStream = await fs.open(filePath, 'w');
    await writeStream.write('['); // JSON 배열 시작

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, movingInfoData.length);
      const batch = movingInfoData.slice(start, end);

      console.log(`Processing batch ${batchIndex + 1}/${totalBatches}...`);

      const batchEstimateRequests = generateEstimateRequestsBatch(
        batch,
        customerIds,
        customerEstimateLimits,
        today
      );

      const jsonBatch = JSON.stringify(batchEstimateRequests, null, 2).slice(
        1,
        -1
      ); // JSON 형식 변환
      await writeStream.write(
        `${batchIndex === 0 ? '' : ','}${jsonBatch}` // 쉼표 처리
      );
    }

    await writeStream.write(']'); // JSON 배열 종료
    await writeStream.close(); // 스트림 닫기

    async function prettifyJsonFile(filePath: string): Promise<void> {
      try {
        console.log('Prettifying JSON file...');
        const rawData = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(rawData); // JSON 파싱
        const prettyData = JSON.stringify(jsonData, null, 2); // Pretty 변환
        await fs.writeFile(filePath, prettyData, 'utf-8'); // 파일 다시 저장
        console.log('JSON file prettified successfully.');
      } catch (error) {
        console.error('Error prettifying JSON file:', error);
      }
    }

    await prettifyJsonFile(filePath);

    console.log(
      `All batches processed. Total EstimateRequests: ${movingInfoData.length}`
    );
    console.log(`EstimateRequest data has been saved to ${filePath}`);
  } catch (error) {
    console.error('Error during EstimateRequest data generation:', error);
  } 
}

// 실행
if (require.main === module) {
  createEstimateRequest()
    .catch((error) => {
      console.error('❌ Error occurred:', error);
    })
    .finally(async () => {
      try {
        console.log('🔌 Disconnecting Prisma...');
        await prisma.$disconnect();
        console.log('✔️ Prisma disconnected successfully.');
      } catch (disconnectError) {
        console.error('❌ Error during Prisma disconnect:', disconnectError);
      }
    });
}
