
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


async function validateCustomerConnections() {
  try {
    // 잘 연결된 customerId 확인
    const validCustomerCount = await prisma.customer.count({
      where: {
        EstimateRequest: {
          some: {
            Estimate: {
              some: {}, // Estimate와 연결된 경우
            },
          },
        },
      },
    });

    // 연결에 오류가 있는 customerId 확인
    const invalidCustomerCount = await prisma.customer.count({
      where: {
        OR: [
          {
            EstimateRequest: {
              none: {}, // EstimateRequest가 없는 경우
            },
          },
          {
            EstimateRequest: {
              some: {
                Estimate: {
                  none: {}, // EstimateRequest가 있지만 Estimate가 없는 경우
                },
              },
            },
          },
        ],
      },
    });

    // 결과 출력
    console.log(`잘 연결된 customerId 갯수: ${validCustomerCount}`);
    console.log(`연결에 오류가 있는 customerId 갯수: ${invalidCustomerCount}`);

    return { validCustomerCount, invalidCustomerCount };
  } catch (error) {
    console.error("연결 검증 중 에러 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 함수 호출
validateCustomerConnections().then(({ validCustomerCount, invalidCustomerCount }) => {
  console.log(`결과: 유효한 연결 = ${validCustomerCount}, 오류가 있는 연결 = ${invalidCustomerCount}`);
}).catch(error => {
  console.error("실행 중 에러 발생:", error);
});



// 함수1
// countConfirmedAndCancelledEstimateRequests();

// 함수 호출
// countEstimateRequests().then(({ countCase1, countCase2 }) => {
//   console.log(`결과: Case1 = ${countCase1}, Case2 = ${countCase2}`);
// }).catch(error => {
//   console.error("실행 중 에러 발생:", error);
// });
