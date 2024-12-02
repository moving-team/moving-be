import { customerSelect } from './customerSelect';
import { movinginfoSelect } from './movingInfoSelect';

export const estimateReqSelect = {
  id: true,
  comment: true,
  isConfirmed: true,
  isCancelled: true,
};

export const estimateReqMovingInfoSelect = {
  ...estimateReqSelect,
  MovingInfo: { select: movinginfoSelect },
};

export const estimateReqCustomerSelect = {
  ...estimateReqSelect,
  Customer: { select: customerSelect },
};
