import { $Enums, Prisma } from '@prisma/client';
import customerRepository from '../repositories/customerRepository';
import estimateRepository from '../repositories/estimateRepository';
import estimateRequestRepository from '../repositories/estimateRequestRepository';
import movingInfoRepository from '../repositories/movingInfoRepository';
import userRepository from '../repositories/userRepository';
import { CreateEstimateReq } from '../structs/estimateRequest-struct';
import {
  EstimateWithMover,
  FindEstimateReqListByMoverType,
  MovingInfoWithEstimateReqAndhDate,
} from '../types/serviceType';
import { todayUTC } from '../utils/dateUtil';
import {
  createEstimateReqMapper,
  findEstimateReqListByCustomerAndCancelMapper,
  findEstimateReqListByCustomerAndConfirmedMapper,
  findEstimateReqListByMoverAndisAssignedMapper,
  getestimateReqByNoConfirmedMapper,
} from './mappers/estimateRequestMapper';
import { customerSelect } from './selects/customerSelect';
import {
  estimateReqCustomerSelect,
  estimateReqDateWithMovingInfoAndCustomerNameSelect,
  estimateReqMovingInfoSelect,
  estimateReqMovingInfoWithDateSelect,
  estimateReqSelect,
} from './selects/estimateRequsetSelect';
import {
  estimateMoverSelect,
  estimateSelect,
  estimateWithUserIdSelect,
} from './selects/estimateSelect';
import {
  movingInfoEstimateReqUserNameWithDateSelect,
  movingInfoEstimateReqWithDateSelect,
  movingInfoSelect,
} from './selects/movingInfoSelect';
import { userCustomerSelect } from './selects/userSelect';
import moverRepository from '../repositories/moverRepository';
import { moverSelect } from './selects/moverSelect';
import { RESION } from '../contents/region';
import {
  getMoverFavoriteStats,
  getMoverReviewStats,
} from '../utils/moverUtile';
import prisma from '../config/prisma';
import notificationRepository from '../repositories/notificationRepository';
import { createNotificationContents } from '../utils/createNotificationContents';
import { CustomError } from '../middlewares/errHandler';

//알림용 import
import { sendNotification } from '../controllers/notificationController';
import { NotificationType } from '../types/serviceType';
import assignedEstimateRequestRepository from '../repositories/assignedEstimateRequestRepository';

export interface PagenationQuery {
  type?: $Enums.serviceType | $Enums.serviceType[];
  isAssigned?: string;
  order?: 'move' | 'request';
  keyWord?: string;
  page?: string;
  pageSize?: string;
}

type KeyWordFilter = {
  contains: string;
  mode: 'insensitive';
};

// 견적 요청 작성 API
async function createEstimateReq(userId: number, data: CreateEstimateReq) {
  const user = await userRepository.findUniqueOrThrowtData({
    where: { id: userId },
    select: userCustomerSelect,
  });

  if (!user.Customer) {
    const err: CustomError = new Error('소비자 전용 API 입니다.');
    err.status = 403;
    throw err;
  } else if (user.Customer.region === 'NULL') {
    // 소비자 프로필 유무 확인
    const err: CustomError = new Error('프로필을 등록 해주세요.');
    err.status = 400;
    throw err;
  }

  const today = todayUTC();

  const checkEstimateReq = await estimateRequestRepository.findFirstData({
    where: {
      customerId: user.Customer.id,
      isConfirmed: false,
      isCancelled: false,
      MovingInfo: {
        movingDate: { gte: today },
      },
    },
  });

  if (checkEstimateReq) {
    const err: CustomError = new Error('이미 요청한 견적이 있습니다.');
    err.status = 400;
    throw err;
  }

  const { comment, movingDate, ...rest } = data;

  const movingDateTime = new Date(movingDate).getTime() + 1000 * 60 * 60 * 24;
  const todayDateTime = new Date().getTime();

  if (movingDateTime < todayDateTime) {
    const err: CustomError = new Error('이미 지난 날짜입니다.');
    err.status = 400;
    throw err;
  }

  // 이사 정보 생성
  const movingInfo = await movingInfoRepository.createData({
    data: {
      ...rest,
      movingDate: new Date(movingDate).toISOString(),
    },
    select: movingInfoSelect,
  });

  // 견적 요청 생성
  const estimateReq = await estimateRequestRepository.createData({
    data: {
      customerId: user.Customer.id,
      movingInfoId: movingInfo.id,
      comment,
    },
    select: estimateReqSelect,
  });

  return createEstimateReqMapper(user.name, movingInfo, estimateReq);
}

// 견적 요청 삭제 API
async function deleteEstimateReq(userId: number, estimateRequestId: number) {
  const [estimateReq, user] = await Promise.all([
    estimateRequestRepository.findFirstData({
      where: { id: estimateRequestId },
      select: estimateReqCustomerSelect,
    }),

    userRepository.findFirstData({
      where: { id: userId },
      select: userCustomerSelect,
    }),
  ]);

  // 견적 요청 유무 확인
  if (!estimateReq) {
    const err: CustomError = new Error('존재하지 않는 견적 요청입니다.');
    err.status = 400;
    throw err;
  } else if (estimateReq.isCancelled) {
    const err: CustomError = new Error('이미 취소된 요청입니다.');
    err.status = 400;
    throw err;
  } else if (estimateReq.isConfirmed) {
    const err: CustomError = new Error(
      '이미 확정한 요청은 취소할 수 없습니다.'
    );
    err.status = 400;
    throw err;
  }

  // 권한 확인
  if (!user || !user.Customer) {
    const err: CustomError = new Error('소비자 전용 API 입니다.');
    err.status = 403;
    throw err;
  } else if (user.Customer.id !== estimateReq.Customer.id) {
    const err: CustomError = new Error('권한이 없습니다.');
    err.status = 401;
    throw err;
  }

  // 해당 요청에 보낸 견적 조회
  const estimateList = await estimateRepository.findManyData({
    where: { estimateRequestId },
    select: estimateWithUserIdSelect,
  });

  const deleteEstimateReq = await prisma.$transaction(async (tx) => {
    // 취소 여부 수정
    const estimateReq = await estimateRequestRepository.updateData({
      where: { id: estimateRequestId },
      data: { isCancelled: true },
      select: estimateReqMovingInfoSelect,
      tx,
    });

    const notifications = await Promise.all(
      estimateList.map(async (estimate) => {
        // 견적 상태 수정
        await estimateRepository.updateData({
          where: { id: estimate.id },
          data: { status: 'REJECTED' },
          select: estimateSelect,
          tx,
        });

        const contents = createNotificationContents({
          type: 'cancel',
          customerName: user.name,
          movingType: estimateReq.MovingInfo.movingType,
        }) as string;

        // 알람 생성
        return notificationRepository.createData({
          data: {
            userId: estimate.Mover.User.id,
            estimateRequestId,
            estimateId: estimate.id,
            contents,
          },
          tx,
        });
      })
    );

    return { estimateReq, notifications };
  });

  // 알림 발송
  if (deleteEstimateReq.notifications) {
    deleteEstimateReq.notifications.forEach((notification) => {
      sendNotification(String(notification.userId), notification);
    });
  }

  return {
    estimateReqId: deleteEstimateReq.estimateReq.id,
    isCancelled: deleteEstimateReq.estimateReq.isCancelled,
  };
}

// 유저-견적 요청 조회 API
async function findEstimateReq(userId: number) {
  const user = await userRepository.findFirstData({
    where: { id: userId },
    select: userCustomerSelect,
  });

  // 유저가 소비자인지 기사인지 확인
  if (!user?.Customer) {
    const err: CustomError = new Error('소비자 전용 API 입니다.');
    err.status = 403;
    throw err;
  }

  const estimateReq = await estimateRequestRepository.findFirstData({
    where: {
      customerId: user.Customer.id,
      isCancelled: false,
    },
    select: estimateReqMovingInfoWithDateSelect,
  });

  // 견적 요청이 있는지 확인
  if (!estimateReq || !estimateReq.MovingInfo) {
    return { message: '견적 요청 내역이 없습니다.' };
  }

  const today = todayUTC();

  const movingInfo = await movingInfoRepository.findFirstData({
    where: {
      movingDate: { gte: today },
      EstimateRequest: {
        id: estimateReq.id,
      },
    },
  });

  // 이사일이 지났는지 확인
  if (!movingInfo) {
    return { message: '견적 요청 내역이 없습니다.' };
  }

  // 확정된 견적이 여부에 따른 response 변경
  if (!estimateReq.isConfirmed) {
    // 확정된 견적이 없을 시

    return getestimateReqByNoConfirmedMapper(user.name, estimateReq);
  } else if (estimateReq.isConfirmed) {
    // 확정된 견적이 있을 시

    const confirmedEstimate = await estimateRepository.findFirstData({
      where: {
        estimateRequestId: estimateReq.id,
        status: 'ACCEPTED',
      },
      select: estimateMoverSelect,
    });

    const resMapper = getestimateReqByNoConfirmedMapper(user.name, estimateReq);
    return {
      ...resMapper,
      moverName: confirmedEstimate?.Mover.nickname,
      estimateId: confirmedEstimate?.id,
    };
  }
}

// 유저-견적 요청 리스트 조회 API
async function findEstimateReqListByCustomer(
  userId: number,
  skip: number,
  pageSize: number
) {
  const customer = await customerRepository.findFirstData({
    where: { userId },
    select: customerSelect,
  });

  // 소비자인지 확인
  if (!customer) {
    const err: CustomError = new Error('소비자 전용 API 입니다.');
    err.status = 403;
    throw err;
  }

  const today = todayUTC();

  const movingInfoWhere = {
    AND: [
      {
        EstimateRequest: { customerId: customer.id },
      },
      {
        OR: [
          { EstimateRequest: { isCancelled: true } },
          { EstimateRequest: { isConfirmed: true } },
          { movingDate: { lt: today } },
        ],
      },
    ],
  };

  // 총 갯수 확인
  const [total, movingInfoList] = await Promise.all([
    // 총 갯수 확인
    movingInfoRepository.countData(movingInfoWhere),

    movingInfoRepository.findManyByPaginationData({
      paginationParams: {
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        where: movingInfoWhere,
      },
      select: movingInfoEstimateReqWithDateSelect,
    }),
  ]);

  const newList = await Promise.all(
    movingInfoList.map(async (movingInfo) => {
      const estimateReq = movingInfo.EstimateRequest;

      // 확정된 견적 요청일 때
      if (estimateReq && estimateReq.isConfirmed) {
        const estimate = (await estimateRepository.findFirstData({
          where: {
            estimateRequestId: estimateReq.id,
            status: 'ACCEPTED',
          },
          select: estimateMoverSelect,
        })) as EstimateWithMover;

        const [reviewStats, confirmationCount, favorite] = await Promise.all([
          // 리뷰 평점 및 갯수
          getMoverReviewStats(estimate.Mover.id),

          // 총 확정 갯수
          estimateRepository.countData({
            moverId: estimate.Mover.id,
            status: 'ACCEPTED',
          }),

          // 찜 갯수 및 찜 여부
          getMoverFavoriteStats(estimate.Mover.id, customer.id),
        ]);

        const { totalReviews, averageScore } = reviewStats;
        const { favoriteCount, isFavorite } = favorite;

        return findEstimateReqListByCustomerAndConfirmedMapper(
          movingInfo as MovingInfoWithEstimateReqAndhDate,
          estimate,
          averageScore,
          totalReviews,
          confirmationCount,
          favoriteCount,
          isFavorite
        );
      }

      // 취소된 견적 요청 또는 이사일이 지난 견적일 때
      return findEstimateReqListByCustomerAndCancelMapper(
        movingInfo as MovingInfoWithEstimateReqAndhDate
      );
    })
  );

  return {
    total,
    list: newList,
  };
}

// 기사-견적 요청 리스트 조회 API
async function findEstimateReqListByMover(
  userId: number,
  query: PagenationQuery
) {
  const {
    type = ['SMALL', 'HOUSE', 'OFFICE'],
    isAssigned = 'true',
    order = 'move',
    keyWord = '',
    page = '1',
    pageSize = '4',
  } = query;

  const movingType = Array.isArray(type) ? type : [type];
  const pageNum = parseInt(page) || 1;
  const take = parseInt(pageSize) || 4;
  const skip = (pageNum - 1) * take;
  const orderBy =
    order === 'request'
      ? { createdAt: 'asc' }
      : { MovingInfo: { movingDate: 'asc' } };
  let validIsAssigned = 'true';
  if (isAssigned === 'true' || isAssigned === 'false') {
    validIsAssigned = isAssigned;
  }
  // 특정 keyWord를 지역에서 찾을 수 있게 변환
  let region = keyWord;
  if (keyWord === '서울특별시' || keyWord === '서울시') {
    region = '서울';
  } else if (keyWord === '경기도') {
    region = '경기';
  } else if (keyWord === '인천광역시') {
    region = '인천';
  } else if (keyWord === '강원도' || keyWord === '강원특별자치도') {
    region = '강원';
  } else if (keyWord === '충청북도') {
    region = '충북';
  } else if (keyWord === '충청남도') {
    region = '충남';
  } else if (keyWord === '세종특별자치시' || keyWord === '세종시') {
    region = '세종';
  } else if (keyWord === '대전광역시') {
    region = '대전';
  } else if (keyWord === '전라북도' || keyWord === '전북특별자치도 ') {
    region = '전북';
  } else if (keyWord === '전라남도') {
    region = '전남';
  } else if (keyWord === '광주광역시') {
    region = '광주';
  } else if (keyWord === '경상북도') {
    region = '경북';
  } else if (keyWord === '경상남도') {
    region = '경남';
  } else if (keyWord === '대구광역시') {
    region = '대구';
  } else if (keyWord === '울산광역시') {
    region = '울산';
  } else if (keyWord === '부산광역시') {
    region = '부산';
  } else if (keyWord === '제주특별자치도' || keyWord === '제주도') {
    region = '제주';
  }

  const keWordFilter: KeyWordFilter = {
    contains: region,
    mode: 'insensitive',
  };

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

  // keyWord에 따른 소비자 이름 검색
  const customerFilter: Prisma.CustomerWhereInput = {
    User: { name: { contains: keyWord, mode: 'insensitive' } },
  };

  // keyWord 여부에 따른 지역 필터 변경
  let regionFilter: Prisma.MovingInfoWhereInput;
  if (keyWord === '') {
    const regionList = mover.serviceRegion.map((item) => RESION[item]);

    regionFilter = {
      OR: regionList.map((region) => {
        return {
          departure: {
            contains: region,
            mode: 'insensitive',
          },
        };
      }),
    };
  } else {
    regionFilter = {
      OR: [{ departure: keWordFilter }, { arrival: keWordFilter }],
    };
  }

  // 내가 작성한 견적에 해당하는 요청 아이디 조회
  const moverEstimateIds = await estimateRepository.findManyData({
    where: {
      moverId: mover.id,
      MovingInfo: { movingDate: { gte: today } },
    },
    select: { estimateRequestId: true },
  });

  const moverEstimateIdsList = moverEstimateIds.map(
    (estimate) => estimate.estimateRequestId
  );

  // 요청 아이디 조회 함수
  async function getByestimateRequestIds({
    isAssigned,
    count,
    assinedList,
  }: {
    isAssigned: boolean;
    count: number;
    assinedList: number[];
  }) {
    return await estimateRepository.groupByData({
      by: ['estimateRequestId'],
      where: {
        isAssigned,
        EstimateRequest: {
          AND: [
            {
              id: { not: { in: [...moverEstimateIdsList, ...assinedList] } }, // 중복 방지를 위한 일부 아이디 제외
              isConfirmed: false,
              isCancelled: false,
              MovingInfo: { movingDate: { gte: today } },
            },
            {
              OR: [{ MovingInfo: regionFilter }, { Customer: customerFilter }],
            },
          ],
        },
      },
      orderBy: { estimateRequestId: 'asc' },
      having: {
        estimateRequestId: {
          _count: { gte: count },
        },
      },
    });
  }

  // 견적 요청 공용 where
  const estimateReqWhere = [
    {
      isConfirmed: false,
      isCancelled: false,
      MovingInfo: { movingDate: { gte: today } },
    },
    {
      OR: [{ MovingInfo: regionFilter }, { Customer: customerFilter }],
    },
  ];

  // 지정견적이 3개 이상인 요청 아이디 조회
  const isAssignedTrueEstimateReqIds = await getByestimateRequestIds({
    isAssigned: true,
    count: 3,
    assinedList: [],
  });

  const isAssignedTrueEstimateReqIdList = isAssignedTrueEstimateReqIds.map(
    (group) => group.estimateRequestId
  );

  // 지정 요청 관련 제외할 아이디
  const excludeAssignedQuest = [
    ...isAssignedTrueEstimateReqIdList,
    ...moverEstimateIdsList,
  ];

  // 지정 요청 리스트 조회
  const [
    assignedEstimateReqIds,
    assignedEstimateReqIdsByMovingType,
    assignedEstimateReqIdsByIsRejected,
  ] = await Promise.all([
    // 그냥 조회
    assignedEstimateRequestRepository.findManyData({
      where: {
        moverId: mover.id,
        isRejected: false,
        EstimateRequest: {
          AND: [
            ...estimateReqWhere,
            { id: { not: { in: excludeAssignedQuest } } },
          ],
        },
      },
      select: { estimateRequestId: true },
    }),

    // query에 따른 조회
    assignedEstimateRequestRepository.findManyData({
      where: {
        moverId: mover.id,
        isRejected: false,
        EstimateRequest: {
          AND: [
            ...estimateReqWhere,
            { id: { not: { in: excludeAssignedQuest } } },
            { MovingInfo: { movingType: { in: movingType } } },
          ],
        },
      },
      select: { estimateRequestId: true },
    }),

    // 반려한 지정 요청 조회
    assignedEstimateRequestRepository.findManyData({
      where: {
        moverId: mover.id,
        isRejected: true,
        EstimateRequest: {
          AND: estimateReqWhere,
        },
      },
      select: { estimateRequestId: true },
    }),
  ]);

  // 지정 요청 갯수
  const assign = assignedEstimateReqIdsByMovingType.length;

  const assignedIdList = assignedEstimateReqIds.map(
    (group) => group.estimateRequestId
  );

  const assignedEstimateReqIdListByMovingType =
    assignedEstimateReqIdsByMovingType.map((id) => id.estimateRequestId);

  const assignedEstimateReqIdListByIsRejected =
    assignedEstimateReqIdsByIsRejected.map((id) => id.estimateRequestId);

  // 일반 요청 관련 제외할 아이디
  const excludeCommonQuest = [
    ...assignedEstimateReqIdListByMovingType,
    ...moverEstimateIdsList,
  ];

  if (validIsAssigned === 'false') {
    // validIsAssigned가 false일 때

    // 일반견적이 5개 이상인 요청 아이디 조회
    const estimateRequestIdGroup = await getByestimateRequestIds({
      isAssigned: false,
      count: 5,
      assinedList: assignedIdList,
    });

    const commonIdList = estimateRequestIdGroup.map(
      (group) => group.estimateRequestId
    );
    console.log({ assignedIdList });
    console.log({ commonIdList });
    console.log({ excludeAssignedQuest });

    let excludeTotalCount = commonIdList;

    if (assign >= 1) {
      excludeTotalCount = [
        ...commonIdList,
        ...assignedEstimateReqIdListByMovingType, // 3개 이상의 지정 견적이 있는거 제외
        ...assignedEstimateReqIdListByIsRejected, // 반려한 지정 요청 제외
        ...moverEstimateIdsList,
      ];
    }

    // movingType에 따른 카운트
    async function totalCount(movingType: $Enums.serviceType[]) {
      return await estimateRequestRepository.countData({
        AND: [
          ...estimateReqWhere,
          {
            id: { not: { in: excludeTotalCount } },
          },
          { MovingInfo: { movingType: { in: movingType } } },
        ],
      });
    }

    const [total, small, house, office] = await Promise.all([
      totalCount(movingType),
      totalCount(['SMALL']),
      totalCount(['HOUSE']),
      totalCount(['OFFICE']),
    ]);

    let list: FindEstimateReqListByMoverType[];
    if (assign >= skip + take) {
      const assignedList =
        await estimateRequestRepository.findManyByPaginationData({
          paginationParams: {
            where: {
              AND: [
                ...estimateReqWhere,
                { id: { in: assignedEstimateReqIdListByMovingType } },
                { MovingInfo: { movingType: { in: movingType } } },
              ],
            },
            orderBy,
            take,
            skip,
          },
          select: estimateReqDateWithMovingInfoAndCustomerNameSelect,
        });

      list = assignedList.map((assigned) => {
        return findEstimateReqListByMoverAndisAssignedMapper(assigned, true);
      });
    } else if (assign > skip && assign < skip + take) {
      const assignedTake = assign - skip;
      const commonTake = take - assignedTake;

      const [assignedList, commonList] = await Promise.all([
        // 지정 요청 조회
        estimateRequestRepository.findManyByPaginationData({
          paginationParams: {
            where: {
              AND: [
                ...estimateReqWhere,
                { id: { in: assignedEstimateReqIdListByMovingType } },
                { MovingInfo: { movingType: { in: movingType } } },
              ],
            },
            orderBy,
            take: assignedTake,
            skip,
          },
          select: estimateReqDateWithMovingInfoAndCustomerNameSelect,
        }),

        // 일반 요청 조회
        estimateRequestRepository.findManyByPaginationData({
          paginationParams: {
            where: {
              AND: [
                ...estimateReqWhere,
                {
                  id: {
                    not: { in: [...commonIdList, ...excludeCommonQuest] },
                  },
                },
                { MovingInfo: { movingType: { in: movingType } } },
              ],
            },
            orderBy,
            take: commonTake,
            skip: 0,
          },
          select: estimateReqDateWithMovingInfoAndCustomerNameSelect,
        }),
      ]);

      const assignedListMapper = assignedList.map((assigned) => {
        return findEstimateReqListByMoverAndisAssignedMapper(assigned, true);
      });

      const commonListMapper = commonList.map((common) => {
        return findEstimateReqListByMoverAndisAssignedMapper(common, false);
      });

      list = [...assignedListMapper, ...commonListMapper];
    } else {
      const commonSkip = skip - assign;

      const commonList =
        await estimateRequestRepository.findManyByPaginationData({
          paginationParams: {
            where: {
              AND: [
                ...estimateReqWhere,
                {
                  id: {
                    not: { in: [...commonIdList, ...excludeCommonQuest] },
                  },
                },
                { MovingInfo: { movingType: { in: movingType } } },
              ],
            },
            orderBy,
            take,
            skip: commonSkip,
          },
          select: estimateReqDateWithMovingInfoAndCustomerNameSelect,
        });

      list = commonList.map((common) => {
        return findEstimateReqListByMoverAndisAssignedMapper(common, false);
      });
    }

    return {
      total,
      small,
      house,
      office,
      assign,
      list,
    };
  } else if (validIsAssigned === 'true') {
    // validIsAssigned가 true일 때

    // movingType에 따른 카운트
    async function totalCount(movingType: $Enums.serviceType[]) {
      return await estimateRequestRepository.countData({
        AND: [
          ...estimateReqWhere,
          { id: { in: assignedIdList } },
          { MovingInfo: { movingType: { in: movingType } } },
        ],
      });
    }

    const [small, house, office] = await Promise.all([
      totalCount(['SMALL']),
      totalCount(['HOUSE']),
      totalCount(['OFFICE']),
    ]);

    const assignedList =
      await estimateRequestRepository.findManyByPaginationData({
        paginationParams: {
          where: {
            AND: [
              ...estimateReqWhere,
              { id: { in: assignedEstimateReqIdListByMovingType } },
              { MovingInfo: { movingType: { in: movingType } } },
            ],
          },
          orderBy,
          take,
          skip,
        },
        select: estimateReqDateWithMovingInfoAndCustomerNameSelect,
      });

    const list = assignedList.map((assigned) => {
      return findEstimateReqListByMoverAndisAssignedMapper(assigned, true);
    });

    return {
      total: assign,
      small,
      house,
      office,
      assign,
      list,
    };
  }
}

export default {
  createEstimateReq,
  deleteEstimateReq,
  findEstimateReq,
  findEstimateReqListByCustomer,
  findEstimateReqListByMover,
};
