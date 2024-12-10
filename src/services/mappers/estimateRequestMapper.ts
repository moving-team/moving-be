import { $Enums } from '@prisma/client';
import {
  EstimateReq,
  EstimateReqWithMovingInfo,
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

export function createEstimateReqMapper(
  name: string,
  movingInfo: MovingInfo,
  estimateReq: EstimateReq
) {
  return {
    id: estimateReq.id,
    name,
    movingType: movingInfo.movingType,
    movingDate: changeMovingDate(movingInfo.movingDate),
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
    movingDate: changeMovingDate(estimateReq.MovingInfo.movingDate),
    departure: estimateReq.MovingInfo.departure,
    arrival: estimateReq.MovingInfo.arrival,
    comment: estimateReq.comment,
    isConfirmed: estimateReq.isConfirmed,
  };
}

export function findEstimateReqListByCustomerAndConfirmedMapper(
  movingInfo: MovingInfoWithEstimateReqAndhDate,
  estimate: EstimateWithMover,
  averageScore: number,
  totalReviews: number,
  totalConfirmed: number,
  favorite: number,
  isFavorite: boolean
) {
  const estimateReq = movingInfo.EstimateRequest;
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
    movingDate: changeMovingDate(movingInfo.movingDate),
    departure: movingInfo.departure,
    arrival: movingInfo.arrival,
    price: estimate.price,
  };
}

export function findEstimateReqListByCustomerAndCancelMapper(
  movingInfo: MovingInfoWithEstimateReqAndhDate
) {
  const estimateReq = movingInfo.EstimateRequest;
  return {
    id: estimateReq.id,
    isConfirmed: estimateReq.isConfirmed,
    isCancelled: estimateReq.isCancelled,
    movingType: movingInfo.movingType,
    movingDate: changeMovingDate(movingInfo.movingDate),
    departure: movingInfo.departure,
    arrival: movingInfo.arrival,
    comment: estimateReq.comment,
    createAt: estimateReq.createdAt,
  };
}

export function findEstimateReqListByMoverMapper(
  movingInfoList: FindEstimateReqListByMoverType
) {
  const estimateReq = movingInfoList.EstimateRequest;
  const name = movingInfoList.EstimateRequest.Customer.User.name;
  const AssignedEstimateReq =
    movingInfoList.EstimateRequest.AssignedEstimateRequest.length;
  const isAssigned = AssignedEstimateReq === 0 ? false : true;
  return {
    id: estimateReq.id,
    name,
    movingType: movingInfoList.movingType,
    movingDate: changeMovingDate(movingInfoList.movingDate),
    departure: movingInfoList.departure,
    arrival: movingInfoList.arrival,
    comment: estimateReq.comment,
    isAssigned,
    createAt: changeMovingDate(estimateReq.createdAt)
  };
}
