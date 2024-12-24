import prisma from '../config/prisma';
import { REGION_NAME_TO_CODE } from '../contents/region';
import assignedEstimateRequestRepository from '../repositories/assignedEstimateRequestRepository';
import estimateRepository from '../repositories/estimateRepository';
import estimateRequestRepository from '../repositories/estimateRequestRepository';
import moverRepository from '../repositories/moverRepository';
import notificationRepository from '../repositories/notificationRepository';
import userRepository from '../repositories/userRepository';
import { createNotificationContents } from '../utils/createNotificationContents';
import { todayUTC } from '../utils/dateUtil';
import { assignedEstimateReqSelect } from './selects/assignedEstimateRequestSelect';
import { estimateReqMovingInfoSelect } from './selects/estimateRequsetSelect';
import { estimateSelect } from './selects/estimateSelect';
import { moverSelect, moverUserSelect } from './selects/moverSelect';
import { userCustomerSelect } from './selects/userSelect';

// 유저-지정 견적 요청 API
async function createAssigned(userId: number, moverId: number) {
  const today = todayUTC();

  const [user, estimateReq, mover] = await Promise.all([
    userRepository.findFirstData({
      where: { id: userId },
      select: userCustomerSelect,
    }),

    estimateRequestRepository.findFirstData({
      where: {
        isConfirmed: false,
        isCancelled: false,
        MovingInfo: { movingDate: { gte: today } },
        Customer: { userId },
      },
      select: estimateReqMovingInfoSelect,
    }),

    moverRepository.findFirstData({
      where: { id: moverId },
      select: moverUserSelect,
    }),
  ]);

  if (!user || !user.Customer) {
    // 소비자 여부 확인
    throw new Error('소비자 전용 API 입니다');
  } else if (!mover) {
    // 기사 여부 확인
    throw new Error('존재하지 않는 기사님입니다');
  } else if (!estimateReq) {
    // 견적 요청 여부 확인
    throw new Error('일반 견적 요청을 먼저 진행해 주세요.');
  }

  const [estimate, assignedEstimateReq] = await Promise.all([
    estimateRepository.findFirstData({
      where: {
        moverId,
        estimateRequestId: estimateReq.id,
      },
      select: estimateSelect,
    }),

    assignedEstimateRequestRepository.findFirstData({
      where: {
        moverId,
        estimateRequestId: estimateReq.id,
      },
      select: assignedEstimateReqSelect,
    }),
  ]);

  const departure = estimateReq.MovingInfo.departure.slice(0, 2);

  if (estimate) {
    // 해당 기사가 견적을 보냈는지 확인
    throw new Error('해당 기사가 보낸 견적가가 존재 합니다.');
  } else if (assignedEstimateReq) {
    // 해당 기사의 지정 여부 확인
    throw new Error('이미 기사님께 지정 견적 요청을 하셨습니다');
  } else if (!mover.serviceRegion.includes(REGION_NAME_TO_CODE[departure])) {
    // 기사의 서비스 지역인지 확인
    throw new Error('해당 기사님의 서비스 지역이 아닙니다.');
  }

  const contents = createNotificationContents({
    type: 'assign',
    customerName: user.name,
    movingType: estimateReq.MovingInfo.movingType,
  }) as string;

  // 지정 견적 생성 및 알림 생성
  await prisma.$transaction(async (tx) => {
    const assignedEstimateReq =
      await assignedEstimateRequestRepository.createData({
        data: { estimateRequestId: estimateReq.id, moverId },
        tx,
      });

    await notificationRepository.createData({
      data: {
        userId: mover.User.id,
        estimateRequestId: estimateReq.id,
        assignedEstimateRequestId: assignedEstimateReq.id,
        contents,
      },
      tx,
    });
  });

  return { isAssignedEstimate: 'true' };
}

export default { createAssigned };
