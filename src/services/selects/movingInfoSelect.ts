import { estimateReqWithDateSelect } from "./estimateRequsetSelect";

export const movingInfoSelect = {
  id: true,
  movingType: true,
  movingDate: true,
  departure: true,
  arrival: true,
};

export const movingInfoEstimateReqWithDateSelect = {
  ...movingInfoSelect,
  EstimateRequest: {select: estimateReqWithDateSelect
  }
}