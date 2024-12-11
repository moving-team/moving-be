import { estimateReqWithDateSelect } from './estimateRequsetSelect';
import { estimateWithMoverIdSelect } from './estimateSelect';

export const movingInfoSelect = {
  id: true,
  movingType: true,
  movingDate: true,
  departure: true,
  arrival: true,
};

export const movingInfoEstimateReqWithDateSelect = {
  ...movingInfoSelect,
  EstimateRequest: { select: estimateReqWithDateSelect },
};
export const movingInfoEstimateWithMoverIdSelect = {
  ...movingInfoSelect,
  Estimate: { select: estimateWithMoverIdSelect },
};

export const movingInfoEstimateReqUserNameWithDateSelect = {
  ...movingInfoSelect,
  EstimateRequest: {
    select: {
      id: true,
      comment: true,
      isConfirmed: true,
      isCancelled: true,
      createdAt: true,
      updatedAt: true,
      AssignedEstimateRequest: { select: { id: true } },
      Customer: {
        select: {
          User: {
            select: { name: true },
          },
        },
      },
    },
  },
};
