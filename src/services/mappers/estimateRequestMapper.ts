import {
  EstimateReq,
  EstimateReqWithMovingInfo,
  EstimateReqWithMovingInfoAndDate,
  EstimateWithMover,
  MovingInfo,
} from '../../types/serviceType';

export function createEstimateReqMapper(
  name: string,
  movingInfo: MovingInfo,
  estimateReq: EstimateReq
) {
  const koreanDateOnly = movingInfo.movingDate.toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });

  return {
    id: estimateReq.id,
    name,
    movingType: movingInfo.movingType,
    movingDate: koreanDateOnly,
    departure: movingInfo.departure,
    arrival: movingInfo.arrival,
    comment: estimateReq.comment || '',
  };
}

export function getestimateReqByNoConfirmedMapper(
  name: string,
  estimateReq: EstimateReqWithMovingInfo
) {
  return {
    id: estimateReq.id,
    name,
    movingType: estimateReq.MovingInfo.movingType,
    movingDate: estimateReq.MovingInfo.movingDate,
    departure: estimateReq.MovingInfo.departure,
    arrival: estimateReq.MovingInfo.arrival,
    comment: estimateReq.comment,
    isConfirmed: estimateReq.isConfirmed,
  };
}

export function findEstimateReqListByCustomerAndConfirmedMapper(
  estimateReq: EstimateReqWithMovingInfoAndDate,
  estimate: EstimateWithMover,
  averageScore: number,
  totalReviews: number,
  totalConfirmed: number,
  favorite: number,
  isFavorite: boolean
) {
  return {
    id: estimateReq.id,
    isConfirmed: estimateReq.isConfirmed,
    isCancelled: estimateReq.isCancelled,
    summary: estimate.Mover.summary,
    profileImage: estimate.Mover.profileImage,
    nickname: estimate.Mover.nickname,
    reviewStats: {
      averageScore,
      totalReviews,
    },
    career: estimate.Mover.career,
    totalConfirmed,
    favorite,
    isFavorite,
    movingDate: estimateReq.MovingInfo.movingDate,
    departure: estimateReq.MovingInfo.departure,
    arrival: estimateReq.MovingInfo.arrival,
    price: estimate.price,
  };
}

export function findEstimateReqListByCustomerAndCancelMapper(
  estimateReq: EstimateReqWithMovingInfoAndDate
) {
  return {
    id: estimateReq.id,
    isConfirmed: estimateReq.isConfirmed,
    isCancelled: estimateReq.isCancelled,
    movingType: estimateReq.MovingInfo.movingType,
    movingDate: estimateReq.MovingInfo.movingDate,
    departure: estimateReq.MovingInfo.departure,
    arrival: estimateReq.MovingInfo.arrival,
    comment: estimateReq.comment,
    createAt: estimateReq.createdAt,
  };
}
