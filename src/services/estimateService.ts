import { Prisma } from '@prisma/client';
import estimateRepository from '../repositories/estimateRepository';
import estimateRequestRepository from '../repositories/estimateRequestRepository';
import moverRepository from '../repositories/moverRepository';
import userRepository from '../repositories/userRepository';
import { EstimateWithMovingInfoAndcustomerNameAndIsConfirmed } from '../types/serviceType';
import { todayUTC } from '../utils/dateUtil';
import {
  getMoverFavoriteStats,
  getMoverReviewStats,
} from '../utils/moverUtile';
import {
  estimateReqInfoMapper,
  findConfirmedEstimateListMapper,
  findReceivedEstimateListMapper,
  findSentEstimateListMapper,
  findWatingEstimateListMapper,
} from './mappers/estimateMapper';
import { estimateReqMovingInfoWithDateSelect } from './selects/estimateRequsetSelect';
import {
  estimateMoverAndMovingInfoSelect,
  estimateMoverSelect,
  estimateWithMovingInfoAndcustomerNameAndIsConfirmedSelect,
  estimateWithMovingInfoAndcustomerNameSelect,
} from './selects/estimateSelect';
import { moverSelect } from './selects/moverSelect';
import { userCustomerSelect } from './selects/userSelect';

// 유저-받았던 견적 리스트 조회 API
async function findReceivedEstimateList(userId: number, estimateReqId: number) {
  const user = await userRepository.findFirstData({
    where: { id: userId },
    select: userCustomerSelect,
  });

  // 소비자인지 확인
  if (!user?.Customer) {
    throw new Error('소비자 전용 API 입니다.');
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
    throw new Error('존재하지 않는 견적 요청입니다.');
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
    throw new Error('기사 전용 API 입니다.');
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
    throw new Error('기사 전용 API 입니다.');
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
    throw new Error('소비자 전용 API 입니다.');
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

export default {
  findReceivedEstimateList,
  findConfirmedEstimateList,
  findSentEstimateList,
  findWatingEstimateList,
};
