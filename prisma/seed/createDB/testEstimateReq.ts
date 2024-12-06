import * as fs from 'fs';
import * as readline from 'readline';

type EstimateRequest = {
  customerId: number;
  movingInfoId: number;
  comment: string;
  isConfirmed: boolean;
  isCancelled: boolean;
  createdAt: Date;
};

// 특정 customerId로 EstimateRequest 조회
function findEstimateRequestsByCustomerId(
  customerId: number,
  estimateRequests: EstimateRequest[]
): void {
  const customerRequests = estimateRequests
    .filter((request) => request.customerId === customerId)
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ); // createdAt 기준 오름차순 정렬

  if (customerRequests.length === 0) {
    console.log(`해당 customerId(${customerId})로 조회된 요청이 없습니다.`);
  } else {
    console.log(`customerId(${customerId})로 조회된 요청 (createdAt 기준 오름차순):`);
    console.table(customerRequests); // 데이터를 테이블 형식으로 출력
  }
}

// 메인 함수
async function main() {
  const filePath = './data/estimateRequest.json'; // JSON 파일 경로

  try {
    // JSON 파일 읽기
    const data = fs.readFileSync(filePath, 'utf-8');
    const estimateRequests: EstimateRequest[] = JSON.parse(data);

    // readline 인터페이스 생성
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'id 입력: ',
    });

    rl.prompt(); // 입력창 표시

    rl.on('line', (input) => {
      const customerId = parseInt(input.trim(), 10);

      if (isNaN(customerId)) {
        console.log('유효한 customerId를 입력하세요.');
      } else {
        findEstimateRequestsByCustomerId(customerId, estimateRequests);
      }

      rl.prompt(); // 다시 입력창 표시
    });
  } catch (error) {
    console.error('파일 읽기 또는 처리 중 오류가 발생했습니다:', error);
  }
}

main();
