import { customerSelect, customerWithUserNameSelect } from './customerSelect';
import { movingInfoSelect } from './movingInfoSelect';

export const estimateReqSelect = {
  id: true,
  comment: true,
  isConfirmed: true,
  isCancelled: true,
};

export const estimateReqWithDateSelect = {
  ...estimateReqSelect,
  createdAt: true,
  updatedAt: true,
};

export const estimateReqWithDateAndCustomerNameSelect = {
  ...estimateReqWithDateSelect,
  Customer: {
    select: {
      User: { select: { name: true } },
    },
  },
};

export const estimateReqMovingInfoSelect = {
  ...estimateReqSelect,
  MovingInfo: { select: movingInfoSelect },
};

export const estimateReqCustomerSelect = {
  ...estimateReqSelect,
  Customer: { select: customerSelect },
};

export const estimateReqwithMovingInfoAndCustomerAndUserNameSelect = {
  ...estimateReqMovingInfoSelect,
  Customer: { select: customerWithUserNameSelect },
};

export const estimateReqMovingInfoWithDateSelect = {
  ...estimateReqMovingInfoSelect,
  createdAt: true,
  updatedAt: true,
};
