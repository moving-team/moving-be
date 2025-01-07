import {
  Estimate,
  EstimateReqWithDate,
  EstimateReqWithMovingInfoAndDate,
  EstimateWithDate,
  EstimateWithMover,
  Mover,
  MovingInfo,
  Review,
} from '../../types/serviceType';
import { changeMovingDate, changeRegion } from '../../utils/mapperUtil';

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

export function findConfirmedEstimateListMapper(
  movingInfo: MovingInfo,
  estimate: EstimateWithDate,
  customerName: string
) {
  return {
    estimateId: estimate.id,
    isMoveDateOver: estimate.isMovingComplete,
    movingType: movingInfo.movingType,
    isAssigned: estimate.isAssigned,
    customerName,
    movingDate: changeMovingDate(movingInfo.movingDate),
    departure: changeRegion(movingInfo.departure),
    arrival: changeRegion(movingInfo.arrival),
    price: estimate.price,
    updatedAt: changeMovingDate(estimate.updatedAt),
  };
}

export function findSentEstimateListMapper(
  movingInfo: MovingInfo,
  estimate: EstimateWithDate,
  customerName: string,
  isReqConfirmed: boolean,
  today: string
) {
  const movingDate = new Date(movingInfo.movingDate).getTime();
  const todayGetTime = new Date(today).getTime();

  let isConfirmed = false;
  let isMoveDateOver = false;
  if (estimate.status === 'ACCEPTED') {
    isConfirmed = true;
  }
  console.log({ id: estimate.id, movingDate, today: todayGetTime });
  if (movingDate < todayGetTime) {
    isMoveDateOver = true;
  }

  return {
    estimateId: estimate.id,
    movingType: movingInfo.movingType,
    isAssigned: estimate.isAssigned,
    isConfirmed,
    isReqConfirmed,
    isMoveDateOver,
    customerName,
    movingDate: changeMovingDate(movingInfo.movingDate),
    departure: changeRegion(movingInfo.departure),
    arrival: changeRegion(movingInfo.arrival),
    price: estimate.price,
    createdAt: changeMovingDate(estimate.createdAt),
  };
}

export function findWatingEstimateListMapper(
  estimate: Estimate,
  mover: Mover,
  movingInfo: MovingInfo,
  averageScore: number,
  totalReviews: number,
  confirmationCount: number,
  favoriteCount: number,
  isFavorite: boolean
) {
  return {
    estimateId: estimate.id,
    moverId: mover.id,
    serviceType: mover.serviceType,
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
    movingDate: changeMovingDate(movingInfo.movingDate),
    departure: changeRegion(movingInfo.departure),
    arrival: changeRegion(movingInfo.arrival),
    price: estimate.price,
  };
}

export function findEstimateDetailByCustomerMapper(
  estimate: Estimate,
  estimateReq: EstimateReqWithDate,
  mover: Mover,
  movingInfo: MovingInfo,
  averageScore: number,
  totalReviews: number,
  confirmationCount: number,
  favoriteCount: number,
  isFavorite: boolean
) {
  let isConfirmed = false;
  if (estimate.status === 'ACCEPTED') {
    isConfirmed = true;
  }

  return {
    estimateId: estimate.id,
    moverId: mover.id,
    isConfirmed,
    isReqConfirmed: estimateReq.isConfirmed,
    serviceType: mover.serviceType,
    isAssigned: estimate.isAssigned,
    summary: mover.summary,
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
    moverComment: estimate.comment,
    customerComment: estimateReq.comment,
    movingRequest: changeMovingDate(estimateReq.createdAt),
    movingType: movingInfo.movingType,
    movingDate: changeMovingDate(movingInfo.movingDate),
    departure: movingInfo.departure,
    arrival: movingInfo.arrival,
  };
}

export function findEstimateDetailByMoverMapper(
  estimate: Estimate,
  estimateReq: EstimateReqWithDate,
  customerName: string,
  movingInfo: MovingInfo
) {
  return {
    estimateId: estimate.id,
    movingType: movingInfo.movingType,
    isAssigned: estimate.isAssigned,
    customerName,
    movingDate: changeMovingDate(movingInfo.movingDate),
    departure: changeRegion(movingInfo.departure),
    arrival: changeRegion(movingInfo.arrival),
    price: estimate.price,
    moverComment: estimate.comment,
    customerComment: estimateReq.comment,
    movingRequest: changeMovingDate(estimateReq.createdAt),
    detailDeparture: movingInfo.departure,
    detailArrival: movingInfo.arrival,
  };
}

export function findMovingCompleteListMapper(
  estimate: EstimateWithDate,
  movingInfo: MovingInfo,
  mover: Mover,
  review: Review | null
) {
  let isReviewWritten = false;
  if (review) {
    isReviewWritten = true;
  }

  return {
    estimateId: estimate.id,
    moverId: mover.id,
    isReviewWritten,
    serviceType: mover.serviceType,
    isAssigned: estimate.isAssigned,
    profileImg: mover.profileImage,
    moverName: mover.nickname,
    movingDate: changeMovingDate(movingInfo.movingDate),
    price: estimate.price,
    createdAt: estimate.createdAt,
  };
}
