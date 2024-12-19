import {
  estimateReqSelect,
  estimateReqWithDateSelect,
} from './estimateRequsetSelect';
import { moverSelect } from './moverSelect';
import { movingInfoSelect } from './movingInfoSelect';

export const estimateSelect = {
  id: true,
  isMovingComplete: true,
  status: true,
  isAssigned: true,
  price: true,
  comment: true,
};

export const estimateWithMovingInfoSelect = {
  ...estimateSelect,
  MovingINfo: { select: movingInfoSelect },
};

export const estimateMoverSelect = {
  ...estimateSelect,
  Mover: { select: moverSelect },
};

export const estimateMoverAndMovingInfoSelect = {
  ...estimateMoverSelect,
  MovingInfo: { select: movingInfoSelect },
};

export const estimateWithMoverAndMovingInfoAndEstimateReqDateSelect = {
  ...estimateMoverAndMovingInfoSelect,
  EstimateRequest: { select: estimateReqWithDateSelect },
};

export const estimateWithMoverAndMovingInfoAndEstimateReqDateAndCustomerNameSelect =
  {
    ...estimateWithMoverAndMovingInfoAndEstimateReqDateSelect,
    Customer: {
      select: {
        User: { select: { name: true } },
      },
    },
  };

export const estimateWithEstimateReqSelect = {
  ...estimateSelect,
  EstimateRequest: { select: estimateReqSelect },
};

export const estimateWithEstimateReqAndMovingInfoSelect = {
  ...estimateWithEstimateReqSelect,
  MovingInfo: { select: movingInfoSelect },
};

export const estimateWithEstimateReqAndMovingInfoAndMoverSelect = {
  ...estimateWithEstimateReqAndMovingInfoSelect,
  Mover: { select: moverSelect },
};

export const estimateWithMoverIdSelect = {
  ...estimateSelect,
  moverId: true,
};

export const estimateWithMovingInfoAndcustomerNameSelect = {
  ...estimateSelect,
  MovingInfo: { select: movingInfoSelect },
  Customer: {
    select: {
      User: { select: { name: true } },
    },
  },
};

export const estimateWithMovingInfoAndcustomerNameAndIsConfirmedSelect = {
  ...estimateWithMovingInfoAndcustomerNameSelect,
  EstimateRequest: {
    select: { isConfirmed: true },
  },
};

export const estimateWithUserIdSelect = {
  ...estimateMoverSelect,
  Mover: {
    select: {
      User: { select: { id: true } },
    },
  },
};
