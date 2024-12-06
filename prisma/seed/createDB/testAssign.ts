import * as fs from 'fs';
import * as readline from 'readline';

// AssignedEstimateRequest 타입 정의
type AssignedEstimateRequest = {
  estimateRequestId: number;
  moverId: number;
  isRejected: boolean;
  createdAt: string; // JSON에서 읽어오므로 문자열로 처리
};

async function testAssignedEstimateRequest() {
  const filePath = './data/assignedEstimateRequest.json';

  // JSON 파일 읽기
  let assignedEstimateRequests: AssignedEstimateRequest[] = [];
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    assignedEstimateRequests = JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    return;
  }

  console.log(`Loaded ${assignedEstimateRequests.length} AssignedEstimateRequests from JSON.`);

  // readline 인터페이스 설정
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '조회할 estimateRequestId를 입력하세요: ',
  });

  rl.prompt();

  rl.on('line', (input) => {
    const estimateRequestId = parseInt(input.trim(), 10);

    if (isNaN(estimateRequestId)) {
      console.log('유효한 숫자를 입력하세요.');
    } else {
      // 해당 estimateRequestId에 대한 데이터 필터링
      const filteredRequests = assignedEstimateRequests.filter(
        (req) => req.estimateRequestId === estimateRequestId
      );

      if (filteredRequests.length === 0) {
        console.log(`estimateRequestId ${estimateRequestId}에 해당하는 데이터가 없습니다.`);
      } else {
        // createdAt 기준 오름차순 정렬
        const sortedRequests = filteredRequests.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        console.log(`estimateRequestId ${estimateRequestId}의 AssignedEstimateRequest 개수: ${sortedRequests.length}`);
        console.log('AssignedEstimateRequests (createdAt 기준 오름차순):');
        console.table(sortedRequests);
      }
    }

    rl.prompt(); // 다음 입력을 대기
  });

  rl.on('close', () => {
    console.log('프로그램을 종료합니다.');
  });
}

testAssignedEstimateRequest();
