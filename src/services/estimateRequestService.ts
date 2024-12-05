import customerRepository from '../repositories/customerRepository';
import estimateRepository from '../repositories/estimateRepository';
import estimateRequestRepository from '../repositories/estimateRequestRepository';
import favoriteRepository from '../repositories/favoriteRepository';
import movingInfoRepository from '../repositories/movingInfoRepository';
import reviewRepository from '../repositories/reviewRepository';
import userRepository from '../repositories/userRepository';
import { CreateEstimateReq } from '../structs/estimateRequest-struct';
import { EstimateWithMover } from '../types/serviceType';
import { checkIfMovingDateOver } from '../utils/dateUtil';
import {
  createEstimateReqMapper,
  findEstimateReqListByCustomerAndCancelMapper,
  findEstimateReqListByCustomerAndConfirmedMapper,
  getestimateReqByNoConfirmedMapper,
} from './mappers/estimateRequestMapper';
import { customerSelect } from './selerts/customerSelect';
import {
  estimateReqCustomerSelect,
  estimateReqMovingInfoSelect,
  estimateReqMovingInfoWithDateSelect,
  estimateReqSelect,
} from './selerts/estimateRequsetSelect';
import { estimateMoverSelect, estimateSelect } from './selerts/estimateSelect';
import { movinginfoSelect } from './selerts/movingInfoSelect';
import { reviewSelect } from './selerts/reviewSelert';
import { userCustomerSelect } from './selerts/userSelect';

// 견적 요청 작성 API
async function createEstimateReq(userId: number, data: CreateEstimateReq) {
  const user = await userRepository.findUniqueOrThrowtData({
    where: { id: userId },
    select: userCustomerSelect,
  });

  // 소비자 프로필 유무 확인
  if (!user.Customer || user.Customer?.region === 'NULL') {
    const error = new Error('프로필을 등록 해주세요');
    throw error;
  }

  // 이사날이 지난 견적 요청 여부 확인

  // 이사 정보 생성
  const { comment, ...rest } = data;
  const movingInfo = await movingInfoRepository.createData({
    data: rest,
    select: movinginfoSelect,
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
  const estimateReq = await estimateRequestRepository.findFirstData({
    where: { id: estimateRequestId },
    select: estimateReqCustomerSelect,
  });

  const user = await userRepository.findUniqueOrThrowtData({
    where: { id: userId },
    select: userCustomerSelect,
  });

  // 견적 요청 유무 확인
  if (!estimateReq) {
    throw new Error('존재하지 않는 견적 요청입니다.');
  } else if (estimateReq.isCancelled) {
    throw new Error('이미 취소된 요청입니다.');
  }

  // 권한 확인
  if (user.Customer && user.Customer.id !== estimateReq?.Customer.id) {
    throw new Error('권한이 없습니다.');
  }

  // 취소 여부 수정
  const deleteEstimateReq = await estimateRequestRepository.updateData({
    where: { id: estimateRequestId },
    data: { isCancelled: true },
    select: estimateReqSelect,
  });

  // 취소 여부가 변경이 안됐을 때
  if (!deleteEstimateReq.isCancelled) {
    throw new Error('다시 시도해 주세요.');
  }

  // 해당 요청에 보낸 견적 조회
  const estimateList = await estimateRepository.findManyData({
    where: { estimateRequestId },
    select: estimateSelect,
  });

  // 견적 상태 수정
  Promise.all(
    estimateList.map(async (estimate) => {
      await estimateRepository.updateData({
        where: { id: estimate.id },
        data: { status: 'REJECTED' },
        select: estimateSelect,
      });
    })
  );

  return {
    id: deleteEstimateReq.id,
    isCancelled: deleteEstimateReq.isCancelled,
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
    throw new Error('소비자 전용 API 입니다.');
  }

  const estimateReq = await estimateRequestRepository.findFirstData({
    where: {
      customerId: user.Customer.id,
      isCancelled: false,
    },
    select: estimateReqMovingInfoSelect,
  });

  // 견적 요청이 있는지 확인
  if (!estimateReq || !estimateReq.MovingInfo) {
    throw new Error('견적 요청 내역이 없습니다.');
  }

  // 이사일이 지났는지 확인
  const isMoveDateOver = checkIfMovingDateOver(
    estimateReq.MovingInfo.movingDate
  );

  if (isMoveDateOver) {
    throw new Error('견적 요청 내역이 없습니다.');
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
      nickname: confirmedEstimate?.Mover.nickname,
      confirmedId: confirmedEstimate?.id,
    };
  }
}

// 유저-견적 요청 리스트 조회
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
    throw new Error('소비자 전용 API 입니다.');
  }

  // 총 갯수 확인
  const total = await estimateRequestRepository.countData({
    customerId: customer.id,
  });

  const estimateReqList =
    await estimateRequestRepository.findManyByPaginationData({
      paginationParams: {
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        where: { customerId: customer.id },
      },
      select: estimateReqMovingInfoWithDateSelect,
    });

  const newList = await Promise.all(
    estimateReqList.map(async (estimateReq) => {
      // 확정된 견적 요청일 때
      if (estimateReq.isConfirmed) {
        const estimate = (await estimateRepository.findFirstData({
          where: {
            estimateRequestId: estimateReq.id,
            status: 'ACCEPTED',
          },
          select: estimateMoverSelect,
        })) as EstimateWithMover;

        // 총 리뷰 수 확인
        const totalReviews = await reviewRepository.countData({
          moverId: estimate.Mover.id,
        });
        let totalScore: number = 0;

        // 리뷰가 1개 이상일 시 리뷰 점수 총합 획득
        if (totalReviews !== 0) {
          const reviewList = await reviewRepository.findManyData({
            where: { moverId: estimate.Mover.id },
            select: reviewSelect,
          });

          totalScore = reviewList.reduce(
            (sum, review) => sum + review.score,
            0
          );
        }

        // 리뷰 평균 점수
        const averageScore = Math.round((totalScore / totalReviews) * 10) / 10;

        // 총 확정 갯수
        const totalConfirmed = await estimateRepository.countData({
          moverId: estimate.Mover.id,
          status: 'ACCEPTED',
        });

        // 찜된 횟수
        const totalFavorite = await favoriteRepository.countData({
          moverId: estimate.Mover.id,
        });

        const favorite = await favoriteRepository.findFirstData({
          where: {
            moverId: estimate.Mover.id,
            customerId: customer.id,
          },
        });

        // 찜 여부
        let isFavorite = false;
        if (favorite) {
          isFavorite = true;
        }

        return findEstimateReqListByCustomerAndConfirmedMapper(
          estimateReq,
          estimate,
          averageScore,
          totalReviews,
          totalConfirmed,
          totalFavorite,
          isFavorite
        );
      }

      // 취소된 견적 요청일 때
      if (estimateReq.isCancelled) {
        return findEstimateReqListByCustomerAndCancelMapper(estimateReq);
      }

      const isMoveDateOver = checkIfMovingDateOver(
        estimateReq.MovingInfo.movingDate
      );

      // 이사일이 지난 견적일 때
      if (isMoveDateOver) {
        return findEstimateReqListByCustomerAndCancelMapper(estimateReq);
      }

      // 이사일이 안지나고 확정또는 취소가 안된 견적 요청일 때
      return false;
    })
  );

  const finalList = newList.filter((item) => item !== false);

  return {
    total,
    list: finalList,
  };
}

export default {
  createEstimateReq,
  deleteEstimateReq,
  findEstimateReq,
  findEstimateReqListByCustomer,
};
