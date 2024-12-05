import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

async function generateFavoriteJsonWithDescriptionWeights() {
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

    // 가중치
    const sortedMovers = movers.sort((a, b) => b.description.length - a.description.length);
    const maxAcceptRate = 30; // 최대 가중치 (1위: 20배)
    const secondAcceptRate = 13; // 2위 가중치 (2위: 13배)
    const minAcceptRate = 1; // 최소 가중치 (하위 Mover: 1배)

    // 1위 Mover ID 로깅
    if (sortedMovers.length > 0) {
      console.log(`1위 Mover ID: ${sortedMovers[0].id}`);
    }

    // 감소폭 계산
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

      return { mover, weight: Math.round(weight) }; // 가중치 정수로 변환
    });

    // 가중치를 기반으로 선택 가능한 목록 생성
    const weightedMovers = moversWithWeights.flatMap(({ mover, weight }) =>
      Array(weight).fill(mover)
    );

    console.log(
      `총 ${customers.length}명의 고객과 ${movers.length}개의 이사업체 데이터를 기반으로 즐겨찾기를 생성합니다.`
    );

    // 랜덤 Favorite 데이터 생성
    const favoriteData = customers.map((customer) => {
      const randomCount = Math.floor(Math.random() * 15) + 1; // 1~15 사이 랜덤 개수
      const selectedMovers = weightedMovers
        .sort(() => 0.5 - Math.random()) // 무작위 섞기
        .slice(0, randomCount);

      return selectedMovers.map((mover) => ({
        customerId: customer.id,
        moverId: mover.id,
      }));
    }).flat();

    // 생성된 총 Favorite 데이터 갯수 로깅
    console.log(`총 생성된 즐겨찾기 데이터 갯수: ${favoriteData.length}`);

    // JSON 파일로 저장
    const filePath = './data/favorite.json'; // 경로 설정
    await fs.mkdir('./data', { recursive: true }); // './data' 디렉토리 생성 (이미 존재하면 무시)
    await fs.writeFile(filePath, JSON.stringify(favoriteData, null, 2), 'utf-8');

    console.log(`Favorite 데이터가 생성되어 ${filePath}에 저장되었습니다.`);
  } catch (error) {
    console.error("Favorite 데이터를 생성하는 중 오류가 발생했습니다:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateFavoriteJsonWithDescriptionWeights();
