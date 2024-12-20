import { EstimateReqWithDate, MovingInfo } from '../../types/serviceType';
import { changeRegion } from '../../utils/mapperUtil';

export function findRejecteListdAssignedMapper(
  estimateReq: EstimateReqWithDate,
  movingInfo: MovingInfo,
  isAssigned: boolean,
  customerName: string,
  updatedAt: Date
) {
  let isRejected = false;
  if (!estimateReq.isCancelled) {
    isRejected = true;
  }

  return {
    estimateReqId: estimateReq.id,
    isRejected,
    isCancelled: estimateReq.isCancelled,
    movingType: movingInfo.movingType,
    isAssigned,
    customerName,
    departure: changeRegion(movingInfo.departure),
    arrival: changeRegion(movingInfo.arrival),
    updatedAt,
  };
}
