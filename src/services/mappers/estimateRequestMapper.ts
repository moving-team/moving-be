import { $Enums } from '@prisma/client';

interface MovingInfo {
  id: number;
  movingType: $Enums.serviceType;
  movingDate: string;
  departure: string;
  arrival: string;
}

interface EstimateReq {
  id: number;
  comment: string | null;
  isConfirmed: boolean;
  isCancelled: boolean;
}

interface EstimateReqWithMovingInfo extends EstimateReq {
  MovingInfo: MovingInfo;
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
    movingDate: movingInfo.movingDate,
    departure: movingInfo.departure,
    arrival: movingInfo.arrival,
    comment: estimateReq.comment || '',
  };
}

export function getestimateReqByNoConfirmed(
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
