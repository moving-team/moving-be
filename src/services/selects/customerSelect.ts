import { userSelect } from "./userSelect";

export const customerSelect = {
  id: true,
  profileImage: true,
  serviceType: true,
  region: true,
};

export const customerWithUserNameSelect = {
  ...customerSelect,
  User: {
    select: userSelect
  }
}