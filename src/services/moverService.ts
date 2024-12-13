import moverRepository from '../repositories/moverRepository';
import favoriteRepository from '../repositories/favoriteRepository';
import assignedEstimateRequestRepository from '../repositories/assignedEstimateRequestRepository';
import estimateRequestRepository from '../repositories/estimateRequestRepository';
import customerRepository from '../repositories/customerRepository';
import userRepository from '../repositories/userRepository';
import { serviceRegion, serviceType } from '@prisma/client';
import bcrypt from 'bcrypt';

const getMoverList = async ({
  page,
  pageSize,
  keyword,
  sortBy,
  sortOrder,
  selectedServiceType,
  selectedServiceRegion,
}: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  sortBy?: 'reviewCount' | 'averageScore' | 'career' | 'confirmationCount';
  sortOrder?: 'asc' | 'desc';
  selectedServiceType?: serviceType;
  selectedServiceRegion?: serviceRegion;
}) => {
  const paginationParams = {
    skip: page ? (page - 1) * (pageSize ?? 10) : 0,
    take: pageSize ?? 10,
  };
  const where = {
    AND: [
      keyword
        ? {
            nickname: {
              contains: keyword,
            },
          }
        : {},
      selectedServiceType
        ? {
            serviceType: {
              has: selectedServiceType,
            },
          }
        : {},
      selectedServiceRegion
        ? {
            serviceRegion: {
              has: selectedServiceRegion,
            },
          }
        : {},
    ],
  };
  const select = {
    id: true,
    userId: true,
    profileImage: true,
    nickname: true,
    career: true,
    summary: true,
    confirmationCount: true,
    serviceType: true,
    serviceRegion: true,
    Review: {
      select: {
        score: true,
      },
    },
  };
  const movers = await moverRepository.findManyAllData({
    where,
    select,
    ...paginationParams,
  });

  const processedMovers = await Promise.all(
    movers.map(async (mover) => {
      const favoriteCount = await favoriteRepository.countData({
        moverId: mover.id,
      });

      let averageScore = 0;
      let reviewCount = 0;

      if (mover.Review && mover.Review.length > 0) {
        reviewCount = mover.Review.length;
        averageScore = Number(
          (
            mover.Review.reduce((sum, review) => sum + review.score, 0) /
            reviewCount
          ).toFixed(1)
        );
      }

      const { Review, profileImage, nickname, ...moverDataWithoutReviews } =
        mover;

      return {
        ...moverDataWithoutReviews,
        profileImg: profileImage,
        moverName: nickname,
        reviewStats: {
          averageScore,
          totalReviews: reviewCount,
        },
        favoriteCount,
      };
    })
  );

  if (sortBy && sortOrder) {
    processedMovers.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'reviewCount':
          valueA = a.reviewStats.totalReviews || 0;
          valueB = b.reviewStats.totalReviews || 0;
          break;
        case 'averageScore':
          valueA = a.reviewStats.averageScore || 0;
          valueB = b.reviewStats.averageScore || 0;
          break;
        case 'career':
          valueA = a.career || 0;
          valueB = b.career || 0;
          break;
        case 'confirmationCount':
          valueA = a.confirmationCount || 0;
          valueB = b.confirmationCount || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
  }

  return {
    list: processedMovers,
    totalCount: movers.length,
    currentPage: page,
    totalPages: Math.ceil(movers.length / (pageSize ?? 10)),
  };
};

const getMoverDetail = async (userId: number, moverId: number) => {
  const moverData = await moverRepository.findFirstData({
    where: { id: moverId },
    select: {
      id: true,
      userId: true,
      profileImage: true,
      nickname: true,
      career: true,
      summary: true,
      description: true,
      confirmationCount: true,
      serviceType: true,
      serviceRegion: true,
      Review: {
        select: {
          score: true,
        },
      },
    },
  });
  const favoriteCount = await favoriteRepository.countData({
    moverId: moverData?.id,
  });
  const customerData = await customerRepository.findFirstData({
    where: { userId: userId },
  });
  const estimateReqData = await estimateRequestRepository.findFirstData({
    where: { customerId: customerData?.id },
  });
  const isAssigned = estimateReqData
    ? !!(await assignedEstimateRequestRepository.findFirstData({
        where: { estimateRequestId: estimateReqData.id },
      }))
    : false;

  if (moverData && moverData.Review) {
    const reviews = moverData.Review;
    const avgScore =
      reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length;
    const reviewCount = reviews.length;

    const { Review, profileImage, nickname, ...moverDataWithoutReviews } =
      moverData;

    return {
      ...moverDataWithoutReviews,
      profileImg: profileImage,
      moverName: nickname,
      reviewStats: {
        averageScore: avgScore,
        totalReviews: reviewCount,
      },
      favoriteCount: favoriteCount,
      isAssigned: isAssigned,
    };
  }

  return moverData;
};

const getMover = async (userId: number) => {
  const moverData = await moverRepository.findFirstData({
    where: { userId: userId },
    select: {
      id: true,
      userId: true,
      profileImage: true,
      nickname: true,
      career: true,
      summary: true,
      description: true,
      confirmationCount: true,
      serviceType: true,
      serviceRegion: true,
      User: {
        select: {
          name: true,
        },
      },
    },
  });
  if (moverData) {
    const { profileImage, nickname, ...moverDataWithoutReviews } = moverData;
    return {
      ...moverDataWithoutReviews,
      profileImg: profileImage,
      moverName: nickname,
    };
  } else {
    throw new Error('프로필 없음');
  }
};

const createMover = async (userId: number) => {
  const data = {
    userId: userId,
    nickname: `mover_${userId}`,
    summary: '',
    description: '',
    career: 0,
    confirmationCount: 0,
  };
  const moverData = await moverRepository.createData({ data });
  return moverData;
};

const patchMoverProfile = async (userId: number, updateData: any) => {
  const moverData = await moverRepository.findFirstData({
    where: { userId: userId },
  });
  if (!moverData) {
    throw new Error('프로필 생성하지 않음');
  }
  const patchData = {
    profileImage: updateData.profileImage,
    nickname: updateData.nickname,
    summary: updateData.summary,
    description: updateData.description,
    career: updateData.career,
  };
  await moverRepository.updateData({
    where: { id: moverData.id },
    data: patchData,
  });
};

const patchMoverInfo = async (userId: number, data: any) => {
  const userData = await userRepository.findFirstData({
    where: { id: userId },
  });
  if (!userData) {
    throw new Error('유저 정보 없음');
  }
  const isPasswordMatch = await bcrypt.compare(
    data.usedPassword,
    userData.password as string
  );
  if (!isPasswordMatch) {
    throw new Error('비밀번호가 일치하지 않아요');
  }
  const newHashedPassword = await bcrypt.hash(data.newPassword, 10);
  const patchData = {
    name: data.name,
    phoneNumber: data.phoneNumber,
    password: newHashedPassword,
  };
  return await userRepository.updateData({
    where: { id: userData.id },
    data: patchData,
  });
};

export {
  createMover,
  patchMoverProfile,
  getMover,
  getMoverDetail,
  getMoverList,
  patchMoverInfo,
};
