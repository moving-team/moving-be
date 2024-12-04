import customerRepository from '../repositories/customerRepository';
import estimateRepository from '../repositories/estimateRepository';
import estimateRequestRepository from '../repositories/estimateRequestRepository';
import moverRepository from '../repositories/moverRepository';
import movingInfoRepository from '../repositories/movingInfoRepository';
import reviewRepository from '../repositories/reviewRepository';
import userRepository from '../repositories/userRepository';
import { CreateEstimateReq } from '../structs/estimateRequest-struct';
import { checkIfMovingDateOver } from '../utils/dateUtil';
import {
  createEstimateReqMapper,
  getestimateReqByNoConfirmed,
} from './mappers/estimateRequestMapper';
import { customerSelect } from './selerts/customerSelect';
import {
  estimateReqCustomerSelect,
  estimateReqMovingInfoSelect,
  estimateReqSelect,
} from './selerts/estimateRequsetSelect';
import { estimateMoverSelect } from './selerts/estimateSelect';
import { movinginfoSelect } from './selerts/movingInfoSelect';
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

    return getestimateReqByNoConfirmed(user.name, estimateReq);
  } else if (estimateReq.isConfirmed) {
    // 확정된 견적이 있을 시

    const confirmedEstimate = await estimateRepository.findFirstData({
      where: {
        estimateRequestId: estimateReq.id,
        status: 'ACCEPTED',
      },
      select: estimateMoverSelect,
    });
    const resMapper = getestimateReqByNoConfirmed(user.name, estimateReq);
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
      select: estimateReqMovingInfoSelect,
    });

  const newList = estimateReqList.map(async (estimateReq) => {
    // 확정된 견적 요청일 때
    if (estimateReq.isConfirmed) {
      const estimate = await estimateRepository.findFirstData({
        where: {
          estimateRequestId: estimateReq.id,
          status: 'ACCEPTED',
        },
        select: estimateMoverSelect,
      });

      const reviewList = await reviewRepository

      const totalConfirmed = await estimateRepository.countData({
        moverId: estimate?.Mover.id,
        status: 'ACCEPTED',
      });

      // "id": "견적 요청 ID",                      estimateReq
      // "isConfirmed": "확정된 요청인지 확인(true)", estimateReq
      // "isCancelled": "취소 여부 (false)",        estimateReq
      // "summary": "한 줄 소개",                   estimate.mover
      // "profileImage": "프로필 이미지 URL",       estimate.mover
      // "nickname": "기사 별명",                   estimate.mover
      // "reviewStats": { // 리뷰 내용
      //   "averageScore": "총 별점",,
      //   "totalReviews": "리뷰 갯수",
      // },
      // "career": "기사님 경력",                   estimate.mover
      // "totalConfirmed": "총 확정 갯수",          totalConfirmed
      // "favorite": "기사님이 찜된 횟수",
      // "isFavorite": "찜 여부 (true , false)",
      // "movingDate": "이사 날짜 (예시, 2024. 11. 28)", estimateReq
      // "departure": "출발지",                         estimateReq
      // "arrival": "도착지"                            estimateReq
      // "price": "견적가",                             estimate
    }
  });
}

export default {
  createEstimateReq,
  deleteEstimateReq,
  findEstimateReq,
};
