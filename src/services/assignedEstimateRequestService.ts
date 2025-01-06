import prisma from '../config/prisma';
import { REGION_NAME_TO_CODE } from '../contents/region';
import { CustomError } from '../middlewares/errHandler';
import assignedEstimateRequestRepository from '../repositories/assignedEstimateRequestRepository';
import estimateRepository from '../repositories/estimateRepository';
import estimateRequestRepository from '../repositories/estimateRequestRepository';
import moverRepository from '../repositories/moverRepository';
import notificationRepository from '../repositories/notificationRepository';
import userRepository from '../repositories/userRepository';
import { createNotificationContents } from '../utils/createNotificationContents';
import { todayUTC } from '../utils/dateUtil';
import { findRejecteListdAssignedMapper } from './mappers/assignedEstimateRequestMapper';
import {
  assignedDateWithMovingInfoAndCustomerNameAndEstimateReqSelect,
  assignedEstimateReqSelect,
} from './selects/assignedEstimateRequestSelect';
import {
  estimateReqMovingInfoSelect,
  estimateReqwithMovingInfoAndCustomerAndUserNameSelect,
} from './selects/estimateRequsetSelect';
import {
  estimateSelect,
  estimateWithMovingInfoAndCustomerNameAndEstimateReqDateSelect,
} from './selects/estimateSelect';
import { moverSelect, moverUserSelect } from './selects/moverSelect';
import { userCustomerSelect } from './selects/userSelect';

//알림용 import
import { sendNotification } from '../controllers/notificationController';
import { NotificationType } from '../types/serviceType';

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
    const err: CustomError = new Error('소비자 전용 API 입니다.');
    err.status = 403;
    throw err;
  } else if (!mover) {
    // 기사 여부 확인
    const err: CustomError = new Error('존재하지 않는 기사님입니다.');
    err.status = 400;
    throw err;
  } else if (!estimateReq) {
    // 견적 요청 여부 확인
    const err: CustomError = new Error('일반 견적 요청을 먼저 진행해 주세요.');
    err.status = 400;
    throw err;
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
    const err: CustomError = new Error('해당 기사가 보낸 견적이 존재 합니다.');
    err.status = 400;
    throw err;
  } else if (assignedEstimateReq) {
    // 해당 기사의 지정 여부 확인
    const err: CustomError = new Error(
      '이미 기사님께 지정 견적 요청을 하셨습니다.'
    );
    err.status = 400;
    throw err;
  } else if (!mover.serviceRegion.includes(REGION_NAME_TO_CODE[departure])) {
    // 기사의 서비스 지역인지 확인
    const err: CustomError = new Error('해당 기사님의 서비스 지역이 아닙니다.');
    err.status = 400;
    throw err;
  }

  const contents = createNotificationContents({
    type: 'assign',
    customerName: user.name,
    movingType: estimateReq.MovingInfo.movingType,
  }) as string;

  // 지정 견적 생성 및 알림 생성
  const result: NotificationType = await prisma.$transaction(async (tx) => {
    const assignedEstimateReq =
      await assignedEstimateRequestRepository.createData({
        data: { estimateRequestId: estimateReq.id, moverId },
        tx,
      });

    const notification = await notificationRepository.createData({
      data: {
        userId: mover.User.id,
        estimateRequestId: estimateReq.id,
        assignedEstimateRequestId: assignedEstimateReq.id,
        contents,
      },
      tx,
    });
    return notification;
  });

  //알림 발송 추가
  if (result) {
    sendNotification(String(mover.User.id), result);
  }

  return { isAssignedEstimate: 'true' };
}

// 기사 - 지정 견적 반려 API
async function rejectedAssigned(userId: number, estimateReqId: number) {
  const [mover, estimateReq, assign] = await Promise.all([
    moverRepository.findFirstData({
      where: { userId },
      select: moverSelect,
    }),

    estimateRequestRepository.findFirstData({
      where: { id: estimateReqId },
      select: estimateReqwithMovingInfoAndCustomerAndUserNameSelect,
    }),

    assignedEstimateRequestRepository.findFirstData({
      where: {
        estimateRequestId: estimateReqId,
        Mover: { userId },
      },
    }),
  ]);

  if (!mover) {
    // 기사인지 확인
    const err: CustomError = new Error('기사 전용 API 입니다.');
    err.status = 403;
    throw err;
  } else if (!estimateReq) {
    // 견적 요청의 존재 여부
    const err: CustomError = new Error('존재하지 않는 견적 요청입니다.');
    err.status = 400;
    throw err;
  } else if (!assign) {
    // 지정 견적 요청의 존재 여부
    const err: CustomError = new Error('존재하지 않는 지정 견적 요청입니다.');
    err.status = 400;
    throw err;
  }

  const todaySting = todayUTC();
  const today = new Date(todaySting).getTime();
  const movingDate = new Date(estimateReq.MovingInfo.movingDate).getTime();

  if (estimateReq.isCancelled) {
    // 요청이 취소 되었을 때
    const err: CustomError = new Error('취소된 요청입니다.');
    err.status = 400;
    throw err;
  } else if (estimateReq.isConfirmed) {
    // 요청이 취소 되어 있을때
    const err: CustomError = new Error('견적을 확정한 요청입니다.');
    err.status = 400;
    throw err;
  } else if (today > movingDate) {
    // 이사 날짜가 지났을때
    const err: CustomError = new Error('이사일이 지난 요청입니다.');
    err.status = 400;
    throw err;
  }

  const contents = createNotificationContents({
    type: 'reject',
    moverName: mover.nickname,
    movingType: estimateReq.MovingInfo.movingType,
  }) as string;

  const reject = await prisma.$transaction(async (tx) => {
    const assignEstimateReq =
      await assignedEstimateRequestRepository.updateData({
        where: { id: assign?.id },
        data: { isRejected: true },
        select: assignedEstimateReqSelect,
        tx,
      });

    const notification = await notificationRepository.createData({
      data: {
        userId: estimateReq.Customer.User.id,
        estimateRequestId: estimateReqId,
        assignedEstimateRequestId: assignEstimateReq.id,
        contents,
      },
      tx,
    });

    return {assignEstimateReq, notification};
  });

    //알림 발송 추가
    if (reject.notification) {
      sendNotification(String(estimateReq.Customer.User.id), reject.notification);
    }

  return {
    assignedEstimateReqId: reject.assignEstimateReq.id,
    isRejected: reject.assignEstimateReq.isRejected,
  };
}

// 기사 - 반려된 견적 요청 및 취소된 견적 요청 조회 API
async function findRejecteListdAssigned(
  userId: number,
  skip: number,
  take: number
) {
  const [mover, total, cancelledRequest, rejectedRequest] = await Promise.all([
    moverRepository.findFirstData({
      where: { userId },
      select: moverSelect,
    }),

    estimateRequestRepository.countData({
      OR: [
        {
          AssignedEstimateRequest: {
            some: { Mover: { userId }, isRejected: true }, // 기사가 지정 견적 요청을 반려한 경우
          },
        },
        {
          isCancelled: true,
          Estimate: { some: { Mover: { userId } } }, // 기사가 견적을 보냈지만 소비자가 요청 자체를 취소한 경우
        },
      ],
    }),

    estimateRepository.findManyData({
      where: {
        EstimateRequest: { isCancelled: true },
        Mover: { userId },
      },
      select: estimateWithMovingInfoAndCustomerNameAndEstimateReqDateSelect,
    }),

    assignedEstimateRequestRepository.findManyData({
      where: {
        isRejected: true,
        Mover: { userId },
      },
      select: assignedDateWithMovingInfoAndCustomerNameAndEstimateReqSelect,
    }),
  ]);

  // 기사인지 확인
  if (!mover) {
    const err: CustomError = new Error('기사 전용 API 입니다.');
    err.status = 403;
    throw err;
  }

  const newCancelledRequest = cancelledRequest.map((data) => {
    const { MovingInfo, Customer, EstimateRequest, ...rest } = data;
    return findRejecteListdAssignedMapper(
      EstimateRequest,
      MovingInfo,
      rest.isAssigned,
      Customer.User.name,
      EstimateRequest.updatedAt
    );
  });

  const newRejectedRequest = rejectedRequest.map((data) => {
    const { EstimateRequest, ...rest } = data;
    const { Customer, MovingInfo, ...rest2 } = EstimateRequest;
    return findRejecteListdAssignedMapper(
      rest2,
      MovingInfo,
      true,
      Customer.User.name,
      rest.updatedAt
    );
  });

  const list = [...newCancelledRequest, ...newRejectedRequest]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() // 정렬렬
    )
    .slice(skip, skip + take); // 페이지네이션

  return {
    total,
    list,
  };
}

export default { createAssigned, rejectedAssigned, findRejecteListdAssigned };
