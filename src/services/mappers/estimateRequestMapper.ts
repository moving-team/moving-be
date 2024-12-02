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
    comment: estimateReq.comment,
  };
}
