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

export const estimateMoverSelect = {
  ...estimateSelect,
  Mover: { select: moverSelect },
};

export const estimateWithMoverIdSelect = {
  ...estimateSelect,
  moverId: true,
};

export const estimateWithMovinInfoAndcustomerNameSelect = {
  ...estimateSelect,
  MovingInfo: { select: movingInfoSelect },
  Customer: {
    select: {
      User: { select: { name: true } },
    },
  },
};
