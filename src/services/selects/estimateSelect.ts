import { moverSelect } from './moverSelect';

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
