import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as readline from 'readline';

const prisma = new PrismaClient();

type Estimate = {
  estimateRequestId: number;
  moverId: number;
  customerId: number;
  isAssigned: boolean;
  price: number;
  status: 'WAITING' | 'ACCEPTED' | 'REJECTED';
  isMovingComplete: boolean;
  comment: string;
  createdAt: Date;
};

async function testCustomerEstimates() {
  // JSON 파일에서 Estimate 데이터 로드
  const estimates: Estimate[] = JSON.parse(
    fs.readFileSync('./data/estimates.json', 'utf-8')
  );

  // DB에서 EstimateRequest 및 MovingInfo 데이터 가져오기
  const estimateRequests = await prisma.estimateRequest.findMany();
  const movingInfos = await prisma.movingInfo.findMany();

  // 데이터 캐싱
  const estimateRequestMap = new Map(
    estimateRequests.map((req) => [req.id, req])
  );
  const movingInfoMap = new Map(
    movingInfos.map((info) => [info.id, info])
  );

  // Readline 인터페이스 생성
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'customerId 입력: ',
  });

  rl.prompt();

  rl.on('line', (input) => {
    const customerId = parseInt(input.trim(), 10);

    if (isNaN(customerId)) {
      console.log('유효한 customerId를 입력하세요.');
    } else {
      // 해당 customerId로 Estimate 필터링
      const customerEstimates = estimates.filter(
        (estimate) => estimate.customerId === customerId
      );

      if (customerEstimates.length === 0) {
        console.log(`customerId(${customerId})로 조회된 견적이 없습니다.`);
      } else {
        console.log(`\ncustomerId(${customerId})의 요청과 관련 데이터:\n`);

        // EstimateRequest를 기준으로 그룹화
        const groupedRequests = customerEstimates.reduce((acc, estimate) => {
          if (!acc[estimate.estimateRequestId]) {
            acc[estimate.estimateRequestId] = [];
          }
          acc[estimate.estimateRequestId].push(estimate);
          return acc;
        }, {} as Record<number, Estimate[]>);

        // MovingDate 기준 정렬
        const sortedEntries = Object.entries(groupedRequests).sort(
          ([estimateRequestIdA], [estimateRequestIdB]) => {
            const movingInfoIdA = estimateRequestMap.get(parseInt(estimateRequestIdA, 10))?.movingInfoId;
            const movingInfoIdB = estimateRequestMap.get(parseInt(estimateRequestIdB, 10))?.movingInfoId;
        
            const movingDateA = movingInfoIdA
              ? movingInfoMap.get(movingInfoIdA)?.movingDate || ''
              : '';
            const movingDateB = movingInfoIdB
              ? movingInfoMap.get(movingInfoIdB)?.movingDate || ''
              : '';
        
            return new Date(movingDateA.replace(/\./g, '-').trim()).getTime() -
                   new Date(movingDateB.replace(/\./g, '-').trim()).getTime();
          }
        );
        
        // 그룹화된 데이터 출력
        sortedEntries.forEach(([estimateRequestId, relatedEstimates]) => {
          const relatedRequest = estimateRequestMap.get(parseInt(estimateRequestId, 10));
          const relatedMovingInfo = relatedRequest
            ? movingInfoMap.get(relatedRequest.movingInfoId)
            : null;

          console.log('--- EstimateRequest ---');
          console.table([relatedRequest || '관련된 요청 없음']);

          console.log('--- MovingInfo ---');
          console.table([relatedMovingInfo || '관련된 이사 정보 없음']);

          console.log('--- Estimates ---');
          const estimateTable = relatedEstimates.map((estimate) => ({
            MoverId: estimate.moverId,
            IsAssigned: estimate.isAssigned,
            Price: estimate.price,
            Status: estimate.status,
            IsMovingComplete: estimate.isMovingComplete,
            Comment: estimate.comment,
            CreatedAt: estimate.createdAt,
          }));
          console.table(estimateTable);

          console.log('♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠');
        });
      }
    }

    rl.prompt();
  });
}

testCustomerEstimates().catch((error) => {
  console.error('Error:', error);
  prisma.$disconnect();
});
