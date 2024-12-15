import { userSelect } from "./userSelect";

export const moverSelect = {
  id: true,
  profileImage: true,
  nickname: true,
  career: true,
  summary: true,
  description: true,
  serviceRegion: true,
  serviceType: true,
  confirmationCount: true,
};

export const moverUserSelect = {
  ...moverSelect,
  User: {select: userSelect}
}

export const favoriteMoverSelect = {
    id: true,
    nickname: true,
    profileImage: true,
    career: true,
    confirmationCount: true,
    serviceType: true,
}