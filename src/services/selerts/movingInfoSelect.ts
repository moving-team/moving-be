import {
  estimateReqWithDateSelect,
} from './estimateRequsetSelect';

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

export const movingInfoEstimateReqUserNameWithDateSelect = {
  ...movingInfoSelect,
  EstimateRequest: {
    select: {
      ...estimateReqWithDateSelect,
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
