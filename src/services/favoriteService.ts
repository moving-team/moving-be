import favoriteRepository from '../repositories/favoriteRepository';
import reviewRepository from '../repositories/reviewRepository';
import userRepository from '../repositories/userRepository';
import { favoriteMoverSelect } from './selects/moverSelect';
import { customerIdOnly } from './selects/userSelect';

export async function toggleFavorite(customerId: number, moverId: number) {
  // 기존 찜 체크
  const existingFavorite = await favoriteRepository.findFirstData({
    where: { customerId, moverId },
    select: { id: true },
  });

  if (existingFavorite) { // 데이터 삭제
    await favoriteRepository.deleteData({ id: existingFavorite.id });
    return { isFavorite: false }; 
  } else { // 데이터 생성

    await favoriteRepository.createData({
      data: { customerId, moverId },
    });
    return { isFavorite: true }; 
  }
}

export async function getFavoriteMovers(customerId: number, skip: number, take: number) {
  // 찜한 기사 조회 및 가져오기
  const favorites = await favoriteRepository.findManyByPaginationData({
    paginationParams: { skip, take, where: { customerId } },
    select: {
      Mover: {
        select: favoriteMoverSelect
      },
    },
  });

  // 리뷰 통계 및 찜 데이터 계산
  const formattedFavorites = await Promise.all(
    favorites.map(async (favorite) => {
      const mover = favorite.Mover;
      const reviewStats = await reviewRepository.aggregateData({
        where: { moverId: mover.id },
        _sum: { score: true },
        _count: { score: true },
      });

      const totalReviews = reviewStats?._count?.score || 0;
      const totalScore = reviewStats?._sum?.score || 0;
      const averageScore =
        totalReviews > 0 ? Math.round((totalScore / totalReviews) * 10) / 10 : 0;

      return {
        moverId: mover.id,
        moverName: mover.nickname,
        profileImg: mover.profileImage || '',
        career: mover.career,
        confirmationCount: mover.confirmationCount,
        serviceType: mover.serviceType,
        reviewStats: {
          averageScore,
          totalReviews,
        },
      };
    })
  );

  // 전체 찜한 기사님 수 조회 및 페이지네이션 상태 확인
  const totalFavorites = await favoriteRepository.countData({ customerId });
  const hasNextPage = skip + take < totalFavorites;

  return {
    total: totalFavorites,
    hasNextPage,
    list: formattedFavorites,
  };
}

