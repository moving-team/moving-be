import { $Enums, Prisma } from '@prisma/client';
import estimateRepository from '../repositories/estimateRepository';
import estimateRequestRepository from '../repositories/estimateRequestRepository';
import moverRepository from '../repositories/moverRepository';
import userRepository from '../repositories/userRepository';
import {
  Estimate,
  EstimateWithMovingInfoAndcustomerNameAndIsConfirmed,
} from '../types/serviceType';
import { todayUTC } from '../utils/dateUtil';
import {
  getMoverFavoriteStats,
  getMoverReviewStats,
} from '../utils/moverUtile';
import {
  estimateReqInfoMapper,
  findConfirmedEstimateListMapper,
  findEstimateDetailByCustomerMapper,
  findEstimateDetailByMoverMapper,
  findMovingCompleteListMapper,
  findReceivedEstimateListMapper,
  findSentEstimateListMapper,
  findWatingEstimateListMapper,
} from './mappers/estimateMapper';
import {
  estimateReqMovingInfoWithDateSelect,
  estimateReqSelect,
  estimateReqwithMovingInfoAndCustomerAndUserNameSelect,
} from './selects/estimateRequsetSelect';
import {
  estimateMoverAndMovingInfoSelect,
  estimateMoverSelect,
  estimateSelect,
  estimateWithEstimateReqAndMovingInfoAndMoverSelect,
  estimateWithMovingInfoAndcustomerNameAndIsConfirmedSelect,
  estimateWithMovingInfoAndcustomerNameSelect,
  estimateDateWithMoverAndMovingInfoAndReviewSelect,
  estimateWithMoverAndMovingInfoAndEstimateReqDateAndCustomerIdAndNameSelect,
} from './selects/estimateSelect';
import { moverSelect, moverUserSelect } from './selects/moverSelect';
import {
  userCustomerSelect,
  userWithCustomerAndMover,
} from './selects/userSelect';
import prisma from '../config/prisma';
import notificationRepository from '../repositories/notificationRepository';
import { createNotificationContents } from '../utils/createNotificationContents';
import { CreateEstimate } from '../structs/estimate-struct';
import assignedEstimateRequestRepository from '../repositories/assignedEstimateRequestRepository';
import { assignedEstimateReqSelect } from './selects/assignedEstimateRequestSelect';
import customerRepository from '../repositories/customerRepository';
import { customerSelect } from './selects/customerSelect';
import { CustomError } from '../middlewares/errHandler';

// 유저-받았던 견적 리스트 조회 API
async function findReceivedEstimateList(userId: number, estimateReqId: number) {
  const user = await userRepository.findFirstData({
    where: { id: userId },
    select: userCustomerSelect,
  });

  // 소비자인지 확인
  if (!user?.Customer) {
    const err: CustomError = new Error('소비자 전용 API 입니다.');
    err.status = 403;
    throw err;
  }

  const [estimateReq, estimateList] = await Promise.all([
    estimateRequestRepository.findFirstData({
      where: {
        id: estimateReqId,
        customerId: user.Customer.id,
      },
      select: estimateReqMovingInfoWithDateSelect,
    }),

    estimateRepository.findManyData({
      where: { estimateRequestId: estimateReqId },
      select: estimateMoverSelect,
    }),
  ]);

  // 견적 요청이 존재하는지 확인
  if (!estimateReq) {
    const err: CustomError = new Error('존재하지 않는 견적 요청입니다.');
    err.status = 400;
    throw err;
  }

  const info = estimateReqInfoMapper(estimateReq);

  // 견적이 없을 시
  if (estimateList.length === 0) {
    return {
      info,
      list: [],
    };
  }

  const acceptedEstimate = estimateList.filter(
    (estimate) => estimate.status === 'ACCEPTED'
  );
  const waitingEstimateList = estimateList.filter(
    (estimate) => estimate.status !== 'ACCEPTED'
  );

  // 확정된 견적 먼저
  const newEstimateList = [...acceptedEstimate, ...waitingEstimateList];

  const customer = user.Customer;

  const list = await Promise.all(
    newEstimateList.map(async (estimate) => {
      // 리뷰 평점 및 갯수
      const { averageScore, totalReviews } = await getMoverReviewStats(
        estimate.Mover.id
      );

      // 총 확정 갯수
      const confirmationCount = await estimateRepository.countData({
        moverId: estimate.Mover.id,
        status: 'ACCEPTED',
      });

      // 찜 갯수 및 찜 여부
      const { favoriteCount, isFavorite } = await getMoverFavoriteStats(
        estimate.Mover.id,
        customer.id
      );
      return findReceivedEstimateListMapper(
        estimate,
        averageScore,
        totalReviews,
        confirmationCount,
        favoriteCount,
        isFavorite
      );
    })
  );

  return { info, list };
}

// 기사-확정된 견적 리스트 조회 API
async function findConfirmedEstimateList(
  userId: number,
  skip: number,
  take: number
) {
  const mover = await moverRepository.findFirstData({
    where: { userId },
    select: moverSelect,
  });

  // 기사인지 확인
  if (!mover) {
    const err: CustomError = new Error('기사 전용 API 입니다.');
    err.status = 403;
    throw err;
  }

  const [total, estimateList] = await Promise.all([
    // 기사가 보낸 확정된 견적 카운트
    estimateRepository.countData({
      moverId: mover.id,
      status: 'ACCEPTED',
    }),

    // 기사가 보낸 확정된 견적 조회
    estimateRepository.findManyByPaginationData({
      paginationParams: {
        orderBy: [
          {
            isMovingComplete: 'asc',
          },
          {
            MovingInfo: { movingDate: 'asc' },
          },
        ],
        skip,
        take,
        where: {
          moverId: mover.id,
          status: 'ACCEPTED',
        },
      },
      select: estimateWithMovingInfoAndcustomerNameSelect,
    }),
  ]);

  const list = estimateList.map((estimate) => {
    const { MovingInfo, Customer, ...rest } = estimate;
    const customerName = Customer.User.name;

    return findConfirmedEstimateListMapper(MovingInfo, rest, customerName);
  });

  return {
    total,
    list,
  };
}

// 기사-보냈 견적 리스트 조회 API
async function findSentEstimateList(
  userId: number,
  skip: number,
  take: number
) {
  const mover = await moverRepository.findFirstData({
    where: { userId },
    select: moverSelect,
  });

  // 기사인지 확인
  if (!mover) {
    const err: CustomError = new Error('기사 전용 API 입니다.');
    err.status = 403;
    throw err;
  }

  const today = todayUTC();

  const whereEntity: Prisma.EstimateWhereInput = {
    moverId: mover.id,
    status: { in: ['ACCEPTED', 'WAITING'] },
  };

  const [total, movingUpcomingCount] = await Promise.all([
    // 총 리스트 갯수
    estimateRepository.countData(whereEntity),

    // 이사일이 안지난 리스트 수
    estimateRepository.countData({
      ...whereEntity,
      MovingInfo: { movingDate: { gte: today } },
    }),
  ]);

  const movingUpcomingOrderBy = [
    {
      status: 'desc',
    },
    {
      MovingInfo: { movingDate: 'asc' },
    },
  ];

  let estimateList: EstimateWithMovingInfoAndcustomerNameAndIsConfirmed[];
  if (movingUpcomingCount >= skip + take) {
    estimateList = await estimateRepository.findManyByPaginationData({
      paginationParams: {
        orderBy: movingUpcomingOrderBy,
        skip,
        take,
        where: {
          ...whereEntity,
          MovingInfo: { movingDate: { gte: today } },
        },
      },
      select: estimateWithMovingInfoAndcustomerNameAndIsConfirmedSelect,
    });
  } else if (movingUpcomingCount > skip && movingUpcomingCount < skip + take) {
    const movingUpcomingTake = movingUpcomingCount - skip;
    const movingOverTake = take - movingUpcomingTake;

    const [movingUpcomingList, movingOverList] = await Promise.all([
      // movingUpcomingList
      estimateRepository.findManyByPaginationData({
        paginationParams: {
          orderBy: movingUpcomingOrderBy,
          skip,
          take: movingUpcomingTake,
          where: {
            ...whereEntity,
            MovingInfo: { movingDate: { gte: today } },
          },
        },
        select: estimateWithMovingInfoAndcustomerNameAndIsConfirmedSelect,
      }),

      // movingOverList
      estimateRepository.findManyByPaginationData({
        paginationParams: {
          orderBy: { MovingInfo: { movingDate: 'asc' } },
          skip: 0,
          take: movingOverTake,
          where: {
            ...whereEntity,
            MovingInfo: { movingDate: { lt: today } },
          },
        },
        select: estimateWithMovingInfoAndcustomerNameAndIsConfirmedSelect,
      }),
    ]);

    estimateList = [...movingUpcomingList, ...movingOverList];
  } else {
    const movingOverSkip = skip - movingUpcomingCount;

    estimateList = await estimateRepository.findManyByPaginationData({
      paginationParams: {
        orderBy: { MovingInfo: { movingDate: 'asc' } },
        skip: movingOverSkip,
        take,
        where: {
          ...whereEntity,
          MovingInfo: { movingDate: { lt: today } },
        },
      },
      select: estimateWithMovingInfoAndcustomerNameAndIsConfirmedSelect,
    });
  }

  const list = estimateList.map((estimate) => {
    const { MovingInfo, Customer, EstimateRequest, ...rest } = estimate;
    const cutomerName = Customer.User.name;
    const isReqConfirmed = EstimateRequest.isConfirmed;

    return findSentEstimateListMapper(
      MovingInfo,
      rest,
      cutomerName,
      isReqConfirmed,
      today
    );
  });

  return {
    total,
    list,
  };
}

// 유저-대기중인 견적 조회 API
async function findWatingEstimateList(userId: number) {
  const user = await userRepository.findFirstData({
    where: { id: userId },
    select: userCustomerSelect,
  });

  if (!user?.Customer) {
    // 소비자자인지 확인
    const err: CustomError = new Error('소비자 전용 API 입니다.');
    err.status = 403;
    throw err;
  }

  const today = todayUTC();
  const customerId = user.Customer.id;

  // 견적 조회(기사님 정보, 이사정보, 지정 견적 먼저, 오래된 순)
  const estimateList = await estimateRepository.findManyData({
    where: {
      customerId,
      MovingInfo: { movingDate: { gte: today } },
      EstimateRequest: {
        isConfirmed: false,
        isCancelled: false,
      },
    },
    orderBy: [{ isAssigned: 'desc' }, { createdAt: 'asc' }],
    select: estimateMoverAndMovingInfoSelect,
  });

  const list = await Promise.all(
    estimateList.map(async (estimate) => {
      const [reviewStats, confirmationCount, favorite] = await Promise.all([
        // 리뷰 평점 및 갯수
        getMoverReviewStats(estimate.Mover.id),

        // 총 확정 갯수
        estimateRepository.countData({
          moverId: estimate.Mover.id,
          status: 'ACCEPTED',
        }),

        // 찜 갯수 및 찜 여부
        getMoverFavoriteStats(estimate.Mover.id, customerId),
      ]);

      const { totalReviews, averageScore } = reviewStats;
      const { favoriteCount, isFavorite } = favorite;
      const { MovingInfo, Mover, ...rest } = estimate;

      return findWatingEstimateListMapper(
        rest,
        Mover,
        MovingInfo,
        averageScore,
        totalReviews,
        confirmationCount,
        favoriteCount,
        isFavorite
      );
    })
  );

  return { list };
}

// 유저-견적 확정 API
async function updateConfirmEstimate(userId: number, estimateId: number) {
  const user = await userRepository.findFirstData({
    where: { id: userId },
    select: userCustomerSelect,
  });

  // 소비자인지 확인
  if (!user?.Customer) {
    const err: CustomError = new Error('소비자 전용 API 입니다.');
    err.status = 403;
    throw err;
  }

  const estimate = await estimateRepository.findFirstData({
    where: {
      id: estimateId,
      customerId: user.Customer.id,
    },
    select: estimateWithEstimateReqAndMovingInfoAndMoverSelect,
  });

  // 해당 견적이 소비자와 관련있는지 확인
  if (!estimate) {
    const err: CustomError = new Error('권한이 없습니다.');
    err.status = 401;
    throw err;
  }

  const estimateReq = estimate.EstimateRequest;
  const movingDate = new Date(estimate.MovingInfo.movingDate).getTime();
  const todayString = todayUTC();
  const today = new Date(todayString).getTime();

  if (estimateReq.isConfirmed) {
    const err: CustomError = new Error(
      '이미 견적이 확정된 요청입니다. 추가 확정은 불가능합니다.'
    );
    err.status = 400;
    throw err;
  } else if (estimateReq.isCancelled) {
    const err: CustomError = new Error(
      '요청이 취소 되어 견적을 확정할 수 없습니다.'
    );
    err.status = 400;
    throw err;
  } else if (movingDate < today) {
    const err: CustomError = new Error(
      '이사 날짜가 지나 견적을 확정할 수 없습니다.'
    );
    err.status = 400;
    throw err;
  }

  const mover = await moverRepository.findFirstData({
    where: { id: estimate.Mover.id },
    select: moverUserSelect,
  });

  if (!mover) {
    const err: CustomError = new Error('다시 시도해주세요.');
    err.status = 400;
    throw err;
  }

  const contents = createNotificationContents({
    type: 'confirm',
    customerName: user.name,
    moverName: mover.nickname,
  }) as string;

  await prisma.$transaction(async (tx) => {
    // 견적 상태 변경
    await estimateRepository.updateData({
      where: { id: estimateId },
      data: { status: 'ACCEPTED' },
      select: estimateSelect,
      tx,
    });

    // 해당 견적의 요청의 isConfirmed 변경
    await estimateRequestRepository.updateData({
      where: { id: estimateReq.id },
      data: { isConfirmed: true },
      select: estimateReqSelect,
      tx,
    });

    // 알림 생성
    await notificationRepository.createData({
      data: {
        userId: mover.User.id,
        estimateRequestId: estimate.EstimateRequest.id,
        estimateId,
        contents,
      },
    });
  });

  return { estimateId, isConfirmed: true };
}

// 기사-견적 작성 API
async function createEstimate(userId: number, reqData: CreateEstimate) {
  const { estimateRequestId, ...rest } = reqData;

  const [mover, estimateReq, checkEstimate, isAssigned] = await Promise.all([
    moverRepository.findFirstData({
      where: { userId },
      select: moverSelect,
    }),

    estimateRequestRepository.findFirstData({
      where: { id: estimateRequestId },
      select: estimateReqwithMovingInfoAndCustomerAndUserNameSelect,
    }),

    // 견적 작성 여부 확인
    estimateRepository.findFirstData({
      where: {
        Mover: { userId },
        estimateRequestId,
      },
    }),

    // 지정 요청 여부 확인
    assignedEstimateRequestRepository.findFirstData({
      where: {
        estimateRequestId,
        Mover: { userId },
        isRejected: false,
      },
      select: assignedEstimateReqSelect,
    }),
  ]);

  if (!mover) {
    // 기사인지 확인
    const err: CustomError = new Error('기사 전용 API 입니다.');
    err.status = 403;
    throw err;
  } else if (
    mover.serviceRegion.length === 0 ||
    mover.serviceType.length === 0
  ) {
    // 프로필 등록 여부 확인
    const err: CustomError = new Error('프로필을 먼저 등록해주세요.');
    err.status = 400;
    throw err;
  } else if (!estimateReq) {
    // 견적 요청 유무 확인
    const err: CustomError = new Error('존재하지 않은 요청입니다.');
    err.status = 400;
    throw err;
  } else if (estimateReq.isConfirmed) {
    // 견적 확정 여부
    const err: CustomError = new Error('이미 확정된 견적이 있는 요청입니다.');
    err.status = 400;
    throw err;
  } else if (estimateReq.isCancelled) {
    // 견적 요청 취소 여부
    const err: CustomError = new Error('취소된 견적입니다.');
    err.status = 400;
    throw err;
  } else if (checkEstimate) {
    // 견적 작성 여부
    const err: CustomError = new Error('이미 견적을 작성하였습니다.');
    err.status = 400;
    throw err;
  }

  const todayString = todayUTC();
  const today = new Date(todayString).getTime();
  const movingDate = new Date(estimateReq.MovingInfo.movingDate).getTime();

  // 이사일이 지났는지 확인
  if (today > movingDate) {
    const err: CustomError = new Error('이사일이 지난 요청입니다.');
    err.status = 400;
    throw err;
  }

  let estimate: Estimate;

  if (isAssigned) {
    const estimateCount = await estimateRepository.countData({
      estimateRequestId,
      isAssigned: true,
    });

    if (estimateCount === 3) {
      const err: CustomError = new Error(
        '해당 견적 요청은 이미 최대치의 견적을 받아 견적을 보낼 수 없습니다.'
      );
      err.status = 400;
      throw err;
    }

    estimate = await prisma.$transaction(async (tx) => {
      const createData = await estimateRepository.createData({
        data: {
          ...rest,
          customerId: estimateReq.Customer.id,
          moverId: mover.id,
          estimateRequestId,
          movingInfoId: estimateReq.MovingInfo.id,
          isAssigned: true,
        },
        select: estimateSelect,
      });

      const contents = createNotificationContents({
        type: 'writen',
        moverName: mover.nickname,
        movingType: estimateReq.MovingInfo.movingType,
      }) as string;

      await notificationRepository.createData({
        data: {
          userId: estimateReq.Customer.User.id,
          estimateRequestId,
          estimateId: createData.id,
          contents,
        },
      });

      return createData;
    });
  } else {
    const estimateCount = await estimateRepository.countData({
      estimateRequestId,
      isAssigned: false,
    });

    if (estimateCount === 5) {
      const err: CustomError = new Error(
        '해당 견적 요청은 이미 최대치의 견적을 받아 견적을 보낼 수 없습니다.'
      );
      err.status = 400;
      throw err;
    }

    estimate = await prisma.$transaction(async (tx) => {
      const createData = await estimateRepository.createData({
        data: {
          ...rest,
          customerId: estimateReq.Customer.id,
          moverId: mover.id,
          estimateRequestId,
          movingInfoId: estimateReq.MovingInfo.id,
        },
        select: estimateSelect,
      });

      const contents = createNotificationContents({
        type: 'writen',
        moverName: mover.nickname,
        movingType: estimateReq.MovingInfo.movingType,
      }) as string;

      await notificationRepository.createData({
        data: {
          userId: estimateReq.Customer.User.id,
          estimateRequestId,
          estimateId: createData.id,
          contents,
        },
      });

      return createData;
    });
  }

  return {
    estimateId: estimate.id,
    comment: estimateReq.comment,
    price: estimate.price,
  };
}

// 견적 상세 조회 API
async function findEstimateDetail(userId: number, estimateId: number) {
  const [estimate, user] = await Promise.all([
    estimateRepository.findFirstData({
      where: { id: estimateId },
      select:
        estimateWithMoverAndMovingInfoAndEstimateReqDateAndCustomerIdAndNameSelect,
    }),

    // 소비자인지, 기사인지 확인
    userRepository.findFirstData({
      where: { id: userId },
      select: userWithCustomerAndMover,
    }),
  ]);

  // 존재하는 견적인지 확인
  if (!estimate) {
    const err: CustomError = new Error('존재하지 않는 견적입니다.');
    err.status = 400;
    throw err;
  }

  const {
    Mover: mover,
    EstimateRequest: estimateReq,
    MovingInfo: movingInfo,
    Customer: customer,
    ...rest
  } = estimate;

  if(user && !user.Mover && user.Customer?.id !== customer.id) {
    const err: CustomError = new Error('권한이 없습니다.');
    err.status = 401;
    throw err;
  }

  if (user && user.Customer && !user.Mover) {
    const [reviewStats, confirmationCount, favorite] = await Promise.all([
      // 리뷰 평점 및 갯수
      getMoverReviewStats(mover.id),

      // 총 확정 갯수
      estimateRepository.countData({
        moverId: mover.id,
        status: 'ACCEPTED',
      }),

      // 찜 갯수 및 찜 여부
      getMoverFavoriteStats(mover.id, user.Customer.id),
    ]);

    const { totalReviews, averageScore } = reviewStats;
    const { favoriteCount, isFavorite } = favorite;

    return findEstimateDetailByCustomerMapper(
      rest,
      estimateReq,
      mover,
      movingInfo,
      averageScore,
      totalReviews,
      confirmationCount,
      favoriteCount,
      isFavorite
    );
  } else if (user && !user.Customer && user.Mover) {
    return findEstimateDetailByMoverMapper(
      estimate,
      estimateReq,
      customer.User.name,
      movingInfo
    );
  }

  const err: CustomError = new Error('다시 시도해 주세요.');
  err.status = 400;
  throw err;
}

// 유저-이사 완료한 견적 리스트 조회 API
async function findMovingCompleteList(
  userId: number,
  take: number,
  skip: number
) {
  const reviewedEstimateWhere = {
    status: 'ACCEPTED' as $Enums.status,
    isMovingComplete: true,
    Customer: { userId },
  };
  const [customer, total, unreviewedEstimateCount] = await Promise.all([
    customerRepository.findFirstData({
      where: { userId },
      select: customerSelect,
    }),

    // 리스트 총 갯수
    estimateRepository.countData(reviewedEstimateWhere),

    // 리뷰 작성가능한 견적 조회
    estimateRepository.countData({ ...reviewedEstimateWhere, Review: null }),
  ]);

  // 소비자인지 확인
  if (!customer) {
    const err: CustomError = new Error('소비자 전용 API 입니다.');
    err.status = 403;
    throw err;
  }

  if (unreviewedEstimateCount >= skip + take) {
    const estimateList = await estimateRepository.findManyByPaginationData({
      paginationParams: {
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        where: { ...reviewedEstimateWhere, Review: null },
      },
      select: estimateDateWithMoverAndMovingInfoAndReviewSelect,
    });

    const list = estimateList.map((estimate) => {
      const { Review, MovingInfo, Mover, ...res } = estimate;
      return findMovingCompleteListMapper(res, MovingInfo, Mover, Review);
    });

    return {
      total,
      list,
    };
  } else if (
    unreviewedEstimateCount > skip &&
    unreviewedEstimateCount < take + skip
  ) {
    const unreviewedEstimateTake = unreviewedEstimateCount - skip;
    const reviewedEstimateTake = take - unreviewedEstimateTake;

    const [unreviewedList, reviewedList] = await Promise.all([
      // 리뷰가 없는 견적 리스트 조회
      estimateRepository.findManyByPaginationData({
        paginationParams: {
          orderBy: { createdAt: 'desc' },
          skip,
          take: unreviewedEstimateTake,
          where: { ...reviewedEstimateWhere, Review: null },
        },
        select: estimateDateWithMoverAndMovingInfoAndReviewSelect,
      }),

      // 리뷰가 있는 견적 조회
      estimateRepository.findManyByPaginationData({
        paginationParams: {
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: reviewedEstimateTake,
          where: { ...reviewedEstimateWhere, Review: { NOT: {} } },
        },
        select: estimateDateWithMoverAndMovingInfoAndReviewSelect,
      }),
    ]);

    const estimateList = [...unreviewedList, ...reviewedList];
    const list = estimateList.map((estimate) => {
      const { Review, MovingInfo, Mover, ...res } = estimate;
      return findMovingCompleteListMapper(res, MovingInfo, Mover, Review);
    });

    return {
      total,
      list,
    };
  } else {
    const movingOverSkip = skip - unreviewedEstimateCount;

    const estimateList = await estimateRepository.findManyByPaginationData({
      paginationParams: {
        orderBy: { createdAt: 'desc' },
        skip: movingOverSkip,
        take,
        where: { ...reviewedEstimateWhere, Review: { NOT: {} } },
      },
      select: estimateDateWithMoverAndMovingInfoAndReviewSelect,
    });

    const list = estimateList.map((estimate) => {
      const { Review, MovingInfo, Mover, ...res } = estimate;
      return findMovingCompleteListMapper(res, MovingInfo, Mover, Review);
    });

    return {
      total,
      list,
    };
  }
}

export default {
  findReceivedEstimateList,
  findConfirmedEstimateList,
  findSentEstimateList,
  findWatingEstimateList,
  updateConfirmEstimate,
  createEstimate,
  findEstimateDetail,
  findMovingCompleteList,
};
