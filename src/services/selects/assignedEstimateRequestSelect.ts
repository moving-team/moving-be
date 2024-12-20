import { estimateReqDateWithMovingInfoAndCustomerNameSelect } from "./estimateRequsetSelect";

export const assignedEstimateReqSelect = {
  id: true,
  isRejected: true,
};

export const assignedDateWithMovingInfoAndCustomerNameAndEstimateReqSelect =
  {
    createdAt: true,
    updatedAt: true,
    EstimateRequest: {
      select: estimateReqDateWithMovingInfoAndCustomerNameSelect,
    },
  };
