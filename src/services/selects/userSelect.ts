import { customerSelect } from './customerSelect';
import { moverSelect } from './moverSelect';

export const userSelect = {
  id: true,
  userType: true,
  name: true,
  email: true,
  phoneNumber: true,
};

export const userCustomerSelect = {
  ...userSelect,
  Customer: { select: customerSelect },
};

export const userWithCustomerAndMover = {
  ...userCustomerSelect,
  Mover: { select: moverSelect },
};

export const customerIdOnly = {
  Customer: {
    select: {
      id: true,
    },
  },
};