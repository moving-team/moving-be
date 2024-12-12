import { dmmfToRuntimeDataModel } from '@prisma/client/runtime/library';
import { customerSelect } from './customerSelect';
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
}

export const estimateReqMovingInfoSelect = {
  ...estimateReqSelect,
  MovingInfo: { select: movingInfoSelect },
};

export const estimateReqCustomerSelect = {
  ...estimateReqSelect,
  Customer: { select: customerSelect },
};

export const estimateReqMovingInfoWithDateSelect = {
  ...estimateReqMovingInfoSelect,
  createdAt: true,
  updatedAt: true,
};
