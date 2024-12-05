import { customerSelect } from './customerSelect';

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
