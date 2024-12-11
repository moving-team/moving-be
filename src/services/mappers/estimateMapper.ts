import {
  EstimateReqWithMovingInfoAndDate,
  EstimateWithMover,
} from '../../types/serviceType';
import { changeMovingDate } from '../../utils/mapperUtil';

export function estimateReqInfoMapper(
  estimateReq: EstimateReqWithMovingInfoAndDate
) {
  return {
    estimateReqId: estimateReq.id,
    movingType: estimateReq.MovingInfo.movingType,
    movingDate: changeMovingDate(estimateReq.MovingInfo.movingDate),
    departure: estimateReq.MovingInfo.departure,
    arrival: estimateReq.MovingInfo.arrival,
    comment: estimateReq.comment,
    isConfirmed: estimateReq.isConfirmed,
    movingRequest: changeMovingDate(estimateReq.createdAt),
  };
}

export function findReceivedEstimateListMapper(
  estimate: EstimateWithMover,
  averageScore: number,
  totalReviews: number,
  confirmationCount: number,
  favoriteCount: number,
  isFavorite: boolean
) {
  const mover = estimate.Mover;
  let isConfirmed = false;
  if (estimate.status === 'ACCEPTED') {
    isConfirmed = true;
  }

  return {
    estimateId: estimate.id,
    moverId: mover.id,
    isConfirmed,
    serviceType: mover.serviceType,
    summary: mover.summary,
    isAssigned: estimate.isAssigned,
    profileImg: mover.profileImage,
    moverName: mover.nickname,
    reviewStats: {
      averageScore,
      totalReviews,
    },
    career: mover.career,
    confirmationCount,
    favoriteCount,
    isFavorite,
    price: estimate.price,
  };
}
