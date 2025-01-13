import {
  EstimateReq,
  EstimateReqWithMovingInfoAndDate,
  EstimateWithMover,
  FindEstimateReqListByMoverAndisAssignedType,
  MovingInfo,
  MovingInfoWithEstimateReqAndhDate,
} from '../../types/serviceType';
import { changeMovingDate, changeRegion } from '../../utils/mapperUtil';

export function createEstimateReqMapper(
  name: string,
  movingInfo: MovingInfo,
  estimateReq: EstimateReq
) {
  return {
    estimateReqId: estimateReq.id,
    customerName: name,
    movingType: movingInfo.movingType,
    movingDate: changeMovingDate(movingInfo.movingDate),
    departure: movingInfo.departure,
    arrival: movingInfo.arrival,
    comment: estimateReq.comment || '',
  };
}

export function getestimateReqByNoConfirmedMapper(
  name: string,
  estimateReq: EstimateReqWithMovingInfoAndDate
) {
  return {
    estimateReqId: estimateReq.id,
    customerName: name,
    movingType: estimateReq.MovingInfo.movingType,
    movingDate: changeMovingDate(estimateReq.MovingInfo.movingDate),
    departure: estimateReq.MovingInfo.departure,
    arrival: estimateReq.MovingInfo.arrival,
    comment: estimateReq.comment,
    isConfirmed: estimateReq.isConfirmed,
    createAt: changeMovingDate(estimateReq.createdAt),
  };
}

export function findEstimateReqListByCustomerAndConfirmedMapper(
  movingInfo: MovingInfoWithEstimateReqAndhDate,
  estimate: EstimateWithMover,
  averageScore: number,
  totalReviews: number,
  confirmationCount: number,
  favoriteCount: number,
  isFavorite: boolean
) {
  const estimateReq = movingInfo.EstimateRequest;
  return {
    estimateReqId: estimateReq.id,
    moverId: estimate.Mover.id,
    isConfirmed: estimateReq.isConfirmed,
    isCancelled: estimateReq.isCancelled,
    isAssigned: estimate.isAssigned,
    profileImg: estimate.Mover.profileImage,
    moverName: estimate.Mover.nickname,
    reviewStats: {
      averageScore,
      totalReviews,
    },
    career: estimate.Mover.career,
    confirmationCount,
    favoriteCount,
    isFavorite,
    movingDate: changeMovingDate(movingInfo.movingDate),
    departure: changeRegion(movingInfo.departure),
    arrival: changeRegion(movingInfo.arrival),
    price: estimate.price,
    createdAt: changeMovingDate(estimateReq.createdAt),
  };
}

export function findEstimateReqListByCustomerAndCancelMapper(
  movingInfo: MovingInfoWithEstimateReqAndhDate
) {
  const estimateReq = movingInfo.EstimateRequest;
  return {
    estimateReqId: estimateReq.id,
    isConfirmed: estimateReq.isConfirmed,
    isCancelled: estimateReq.isCancelled,
    movingType: movingInfo.movingType,
    movingDate: changeMovingDate(movingInfo.movingDate),
    departure: changeRegion(movingInfo.departure),
    arrival: changeRegion(movingInfo.arrival),
    comment: estimateReq.comment,
    createAt: estimateReq.createdAt,
  };
}

export function findEstimateReqListByMoverAndisAssignedMapper(
  estimateReq: FindEstimateReqListByMoverAndisAssignedType,
  isAssigned: boolean
) {
  const { MovingInfo, Customer, ...rest } = estimateReq;
  return {
    estimateReqId: rest.id,
    customerName: Customer.User.name,
    movingType: MovingInfo.movingType,
    movingDate: changeMovingDate(MovingInfo.movingDate),
    departure: MovingInfo.departure,
    arrival: MovingInfo.arrival,
    comment: rest.comment,
    isAssigned,
    updatedAt: estimateReq.updatedAt,
  };
}
