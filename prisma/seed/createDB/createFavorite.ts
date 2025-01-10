import { prisma } from '../helper/helperDB';
import fs from 'fs/promises';
import path from 'path';

const BATCH_SIZE = 100; // 배치 크기

export async function createFavorite() {
  try {
    // 고객(Customer) 목록 가져오기
    const customers = await prisma.customer.findMany();
    if (customers.length === 0) {
      console.log("고객 데이터가 없습니다. 고객 데이터를 먼저 생성해주세요.");
      return;
    }

    // 이사업체(Mover) 목록 가져오기
    const movers = await prisma.mover.findMany();
    if (movers.length === 0) {
      console.log("이사업체 데이터가 없습니다. 이사업체 데이터를 먼저 생성해주세요.");
      return;
    }

    // 가중치 계산
    const sortedMovers = movers.sort((a, b) => b.description.length - a.description.length);
    const maxAcceptRate = 30; // 최대 가중치 (1위: 30배)
    const secondAcceptRate = 13; // 2위 가중치 (13배)
    const minAcceptRate = 1; // 최소 가중치 (하위 Mover: 1배)

    const decreaseFactor = (secondAcceptRate - minAcceptRate) / (movers.length - 2);

    const moversWithWeights = sortedMovers.map((mover, index) => {
      let weight: number;

      if (index === 0) {
        weight = maxAcceptRate; // 1위
      } else if (index === 1) {
        weight = secondAcceptRate; // 2위
      } else {
        weight = Math.max(secondAcceptRate - (index - 1) * decreaseFactor, minAcceptRate); // 3위 이하
      }

      return { mover, weight: Math.round(weight) };
    });

    // 가중치를 기반으로 선택 가능한 목록 생성
    const weightedMovers = moversWithWeights.flatMap(({ mover, weight }) =>
      Array(weight).fill(mover)
    );

    console.log(
      `총 ${customers.length}명의 고객과 ${movers.length}개의 이사업체 데이터를 기반으로 즐겨찾기를 생성합니다.`
    );

    const totalBatches = Math.ceil(customers.length / BATCH_SIZE);
    const filePath = path.join(__dirname, './data/favorite.json');
    await fs.mkdir(path.dirname(filePath), { recursive: true }); // 폴더 생성

    // JSON 파일 작성 스트림 열기
    const writeStream = await fs.open(filePath, 'w');
    await writeStream.write('['); // JSON 배열 시작

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, customers.length);
      const customerBatch = customers.slice(start, end);

      console.log(`Processing batch ${batchIndex + 1}/${totalBatches}...`);

      const batchData = customerBatch.flatMap((customer) => {
        const randomCount = Math.floor(Math.random() * 15) + 1; // 1~15 사이 랜덤 개수
        const selectedMovers = weightedMovers
          .sort(() => 0.5 - Math.random()) // 무작위 섞기
          .slice(0, randomCount);

        return selectedMovers.map((mover) => ({
          customerId: customer.id,
          moverId: mover.id,
        }));
      });

      const jsonBatch = JSON.stringify(batchData, null, 2).slice(1, -1); // JSON 문자열화
      await writeStream.write(`${batchIndex === 0 ? '' : ','}${jsonBatch}`); // JSON 데이터 추가
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

    console.log(`즐겨찾기 데이터가 ${filePath}에 저장되었습니다.`);
  } catch (error) {
    console.error("즐겨찾기 데이터를 생성하는 중 오류가 발생했습니다:", error);
  } 
}


if (require.main === module) {
  createFavorite()
    .catch((error) => {
      console.error('❌ 오류 발생:', error);
    })
    .finally(async () => {
      try {
        console.log('🔌 Prisma 클라이언트 연결을 해제합니다.');
        await prisma.$disconnect();
        console.log('✔️ 연결이 안전하게 해제되었습니다.');
      } catch (disconnectError) {
        console.error('❌ Prisma 연결 해제 중 오류 발생:', disconnectError);
      }
    });
}