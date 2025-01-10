import { prisma } from '../../helper/helperDB';

export async function findLogAndFixMismatchedCustomerIds() {
  try {
    const estimates = await prisma.estimate.findMany({
      select: {
        id: true,
        customerId: true,
        estimateRequestId: true,
      },
    });

    const estimateRequests = await prisma.estimateRequest.findMany({
      select: {
        id: true,
        customerId: true,
      },
    });

    // map 변환
    const estimateRequestMap = new Map(
      estimateRequests.map((er) => [er.id, er.customerId])
    );

    // 불일치 데이터 확인, 로깅 및 수정
    for (const estimate of estimates) {
      const requestCustomerId = estimateRequestMap.get(estimate.estimateRequestId);
      if (requestCustomerId !== estimate.customerId) {
        console.log(`불일치 발견:`);
        console.log(`Estimate ID: ${estimate.id}`);
        console.log(`Estimate Customer ID: ${estimate.customerId}`);
        console.log(`EstimateRequest ID: ${estimate.estimateRequestId}`);
        console.log(`EstimateRequest Customer ID: ${requestCustomerId}`);

        // 불일치 데이터 수정
        await prisma.estimate.update({
          where: { id: estimate.id },
          data: { customerId: requestCustomerId },
        });

        console.log(`Estimate ID ${estimate.id}의 Customer ID가 ${requestCustomerId}로 업데이트되었습니다.`);
      }
    }

    console.log("불일치 확인 및 수정 완료.");
  } catch (error) {
    console.error("데이터 검증 중 에러 발생:", error);
    throw error;
  } 
}


if (require.main === module) {
  findLogAndFixMismatchedCustomerIds()
    .catch((error) => {
      console.error('❌실행 중 오류 발생:', error);
    })
    .finally(async () => {
      await prisma.$disconnect();
      console.log('🔌 실행 완료.');
    });
}


// 함수 호출
// findLogAndFixMismatchedCustomerIds().then(() => {
//   console.log("실행 완료");
// }).catch((error) => {
//   console.error("실행 중 에러 발생:", error);
// });
