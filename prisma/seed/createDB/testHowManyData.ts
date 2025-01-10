
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function countConfirmedAndCancelledEstimateRequests() {
  try {
    const count = await prisma.estimateRequest.count({
      where: {
        isConfirmed: true,
        isCancelled: true,
      },
    });

    console.log(`Number of records where isConfirmed and isCancelled are both true: ${count}`);
    return count;
  } catch (error) {
    console.error("Error counting estimate requests:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function countEstimateRequests() {
  try {
    // 1. EstimateRequest의 isConfirmed가 false이고 연결된 Estimate의 status가 ACCEPT인 데이터 갯수 확인
    const countCase1 = await prisma.estimateRequest.count({
      where: {
        isConfirmed: false,
        Estimate: {
          some: {
            status: "ACCEPTED",
          },
        },
      },
    });

    // 로깅: 첫 번째 조건에 맞는 데이터 갯수 출력
    console.log(`isConfirmed가 false이고 연결된 Estimate의 status가 ACCEPT인 데이터 갯수: ${countCase1}`);

    // 2. EstimateRequest의 isConfirmed가 true이고 연결된 Estimate의 status가 ACCEPT인 데이터 갯수 확인
    const countCase2 = await prisma.estimateRequest.count({
      where: {
        isConfirmed: true,
        Estimate: {
          some: {
            status: "ACCEPTED",
          },
        },
      },
    });

    // 로깅: 두 번째 조건에 맞는 데이터 갯수 출력
    console.log(`isConfirmed가 true이고 연결된 Estimate의 status가 ACCEPT인 데이터 갯수: ${countCase2}`);

    // 결과 반환
    return { countCase1, countCase2 };
  } catch (error) {
    // 에러 발생 시 로깅
    console.error("데이터 조회 중 에러 발생:", error);
    throw error;
  } finally {
    // Prisma Client 연결 종료
    await prisma.$disconnect();
  }
}



async function findAndLogMismatchedCustomerIds() {
  try {
    // Estimate에서 데이터 가져오기
    const estimates = await prisma.estimate.findMany({
      select: {
        id: true,
        customerId: true,
        estimateRequestId: true,
      },
    });

    // EstimateRequest에서 데이터 가져오기
    const estimateRequests = await prisma.estimateRequest.findMany({
      select: {
        id: true,
        customerId: true,
      },
    });

    // EstimateRequest 데이터를 Map으로 변환 (빠른 검색을 위해)
    const estimateRequestMap = new Map(
      estimateRequests.map((er) => [er.id, er.customerId])
    );

    // 불일치 데이터 확인 및 로깅
    estimates.forEach((estimate) => {
      const requestCustomerId = estimateRequestMap.get(estimate.estimateRequestId);
      if (requestCustomerId !== estimate.customerId) {
        console.log(`불일치 발견:`);
        console.log(`Estimate ID: ${estimate.id}`);
        console.log(`Estimate Customer ID: ${estimate.customerId}`);
        console.log(`EstimateRequest ID: ${estimate.estimateRequestId}`);
        console.log(`EstimateRequest Customer ID: ${requestCustomerId}`);
      }
    });

    console.log("불일치 확인 완료.");
  } catch (error) {
    console.error("데이터 검증 중 에러 발생:", error);
    throw error;
  } finally {
    // Prisma Client 연결 종료
    await prisma.$disconnect();
  }
}

// 함수 호출
findAndLogMismatchedCustomerIds().then(() => {
  console.log("실행 완료");
}).catch((error) => {
  console.error("실행 중 에러 발생:", error);
});


// 함수 호출
// validateCustomerConnections().then(({ validCustomerCount, invalidCustomerCount }) => {
//   console.log(`결과: 유효한 연결 = ${validCustomerCount}, 오류가 있는 연결 = ${invalidCustomerCount}`);
// }).catch(error => {
//   console.error("실행 중 에러 발생:", error);
// });



// 함수1
// countConfirmedAndCancelledEstimateRequests();

// 함수 호출
// countEstimateRequests().then(({ countCase1, countCase2 }) => {
//   console.log(`결과: Case1 = ${countCase1}, Case2 = ${countCase2}`);
// }).catch(error => {
//   console.error("실행 중 에러 발생:", error);
// });
