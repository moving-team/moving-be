export const reviewSelect = {
  id: true,
  score: true,
  description: true,
};

export const reviewListSelect = {
  id: true,
  score: true,
  description: true,
  createdAt: true,
  Customer: {
    select: {
      User: { select: { name: true } },
    },
  },
}

export const myReviewSelect = {
  id: true,
  score: true,
  description: true,
  createdAt: true,
  Mover: {
    select: {
      id: true,
      nickname: true,
      profileImage: true,
    },
  },
  Estimate: {
    select: {
      isAssigned: true,
      price: true,
      MovingInfo: {
        select: {
          movingDate: true,
          movingType: true,
        },
      },
    },
  },
};