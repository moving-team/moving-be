import {
  EstimateReq,
  EstimateReqWithMovingInfo,
  EstimateReqWithMovingInfoAndDate,
  EstimateWithMover,
  FindEstimateReqListByMoverType,
  MovingInfo,
  MovingInfoWithEstimateReqAndhDate,
} from '../../types/serviceType';

function changeMovingDate(movingDate: Date) {
  return movingDate
    .toLocaleDateString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '.');
}

function changeRegion(region: string) {
  if (region.slice(0, 2) === '세종') {
    const parts = region.split(' ');
    return parts[1] === '세종시' ? `세종 ${parts[2]}` : `세종 ${parts[1]}`;
  } else if (region.slice(0, 2) === '제주') {
    const parts = region.split(' ');
    return `제주 ${parts[1]}`;
  } else if (region.slice(0, 2) === '강원') {
    const parts = region.split(' ');
    return `강원 ${parts[1]}`;
  } else if (region.slice(0, 2) === '전북') {
    const parts = region.split(' ');
    return `전북 ${parts[1]}`;
  } else {
    const parts = region.split(' ');
    return `${parts[0]} ${parts[1]}`;
  }
}

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
    createAt: changeMovingDate(estimateReq.createdAt)
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
    isConfirmed: estimateReq.isConfirmed,
    isCancelled: estimateReq.isCancelled,
    isAssigned: estimate.isAssigned,
    profileImg: estimate.Mover.profileImage,
    nickname: estimate.Mover.nickname,
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
    createdAt: changeMovingDate(estimateReq.createdAt)
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

export function findEstimateReqListByMoverMapper(
  movingInfoList: FindEstimateReqListByMoverType
) {
  const estimateReq = movingInfoList.EstimateRequest;
  const customerName = movingInfoList.EstimateRequest.Customer.User.name;
  const AssignedEstimateReq =
    movingInfoList.EstimateRequest.AssignedEstimateRequest.length;
  const isAssigned = AssignedEstimateReq === 0 ? false : true;
  return {
    estimateReqId: estimateReq.id,
    customerName,
    movingType: movingInfoList.movingType,
    movingDate: changeMovingDate(movingInfoList.movingDate),
    departure: changeRegion(movingInfoList.departure),
    arrival: changeRegion(movingInfoList.arrival),
    comment: estimateReq.comment,
    isAssigned,
    createAt: changeMovingDate(estimateReq.createdAt),
  };
}
