import { serviceType } from '@prisma/client';
import { getServiceTypes } from '../generate/getServiceType';
import { getRandomAddress } from '../generate/getAddress';
import * as fs from 'fs/promises';
import path from 'path';

const BATCH_SIZE = 100; // 배치 크기

type MovingInfoData = {
  movingType: serviceType;
  movingDate: Date;
  departure: string;
  arrival: string;
  createdAt: Date;
};

// 무작위 날짜 생성 함수
function generateRandomDate(): Date {
  const start = new Date('2023-01-01');
  const end = new Date('2025-01-08');
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date;
}

// movingDate를 createdAt의 20일 이후로 설정하는 함수
function calculateMovingDate(createdAt: Date): Date {
  const movingDate = new Date(createdAt);
  movingDate.setDate(movingDate.getDate() + 20);
  return movingDate;
}

// 단일 배치 데이터 생성 함수
function generateMovingInfoBatch(batchSize: number): MovingInfoData[] {
  const movingInfoBatch: MovingInfoData[] = [];

  for (let i = 0; i < batchSize; i++) {
    const createdAt = generateRandomDate();
    const movingDate = calculateMovingDate(createdAt);

    movingInfoBatch.push({
      movingType: getServiceTypes() as serviceType,
      movingDate,
      departure: getRandomAddress(),
      arrival: getRandomAddress(),
      createdAt,
    });
  }

  return movingInfoBatch;
}

const EXPORT_FILE_PATH = path.resolve(__dirname, './data/movingInfo.json');

export async function createMovingInfo(isTest: boolean = false): Promise<void> {
  let movingInfoCount = 0;
  isTest ? (movingInfoCount = 300) : (movingInfoCount = 10000);

  try {
    console.log(`총 ${movingInfoCount}개의 MovingInfo 데이터를 생성합니다.`);

    const totalBatches = Math.ceil(movingInfoCount / BATCH_SIZE);

    // JSON 파일 작성 스트림 열기
    await fs.mkdir(path.dirname(EXPORT_FILE_PATH), { recursive: true });
    const writeStream = await fs.open(EXPORT_FILE_PATH, 'w');

    await writeStream.write('['); // JSON 배열 시작

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchSize = Math.min(
        BATCH_SIZE,
        movingInfoCount - batchIndex * BATCH_SIZE
      );

      const movingInfoBatch = generateMovingInfoBatch(batchSize);

      // JSON 형식 변환 및 스트리밍 저장
      const jsonBatch = movingInfoBatch
        .map((item) => ({
          ...item,
          movingDate: item.movingDate.toISOString(),
          createdAt: item.createdAt.toISOString(),
        }))
        .map((item) => JSON.stringify(item))
        .join(',');

      // 첫 번째 배치에는 쉼표 없이 시작
      await writeStream.write(`${batchIndex === 0 ? '' : ','}${jsonBatch}`);

      console.log(
        `Processed batch ${batchIndex + 1}/${totalBatches} (${
          movingInfoBatch.length
        } records)`
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

    await prettifyJsonFile(EXPORT_FILE_PATH);

    console.log(
      `${movingInfoCount}개의 MovingInfo 데이터가 ${EXPORT_FILE_PATH}에 저장되었습니다.`
    );
  } catch (error) {
    console.error(
      'MovingInfo 데이터를 생성하는 중 오류가 발생했습니다:',
      error
    );
  }
}

if (require.main === module) {
  createMovingInfo();
}
