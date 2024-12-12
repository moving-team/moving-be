import favoriteRepository from '../repositories/favoriteRepository';
import reviewRepository from '../repositories/reviewRepository';

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



// 내가 찜한 기사님 목록 조회
export async function getFavoriteMovers(
  customerId: number,
  skip: number,
  take: number
) {
  try {
    if (!customerId) {
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }

    const favorites = await favoriteRepository.findManyByPaginationData({
      paginationParams: { skip, take, where: { customerId } },
      select: {
        Mover: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            career: true,
            confirmationCount: true,
            serviceType: true,
          },
        },
      },
    });

    // 찜한 데이터가 없는 경우 처리
    if (!favorites.length) {
      return {
        total: 0,
        hasNextPage: false,
        list: [],
      };
    }

    // 4. 총 찜 개수 확인
    const totalFavorites = await favoriteRepository.countData({
      customerId,
    });

    // 추가 데이터 처리 (리뷰 통계, 찜 개수)
    const list = await Promise.all(
      favorites.map(async (favorite) => {
        const mover = favorite.Mover;

        if (!mover) {
          return null;
        }

        // 리뷰 통계 계산
        const totalReviews = await reviewRepository.countData({
          moverId: mover.id,
        });

        const reviewList = await reviewRepository.findManyData({
          where: { moverId: mover.id },
          select: { score: true },
        });

        const totalScore = reviewList.reduce(
          (sum, review) => sum + review.score,
          0
        );

        const averageScore =
          totalReviews > 0
            ? Math.round((totalScore / totalReviews) * 10) / 10
            : 0;

        // 총 찜 수 계산
        const favoriteCount = await favoriteRepository.countData({
          moverId: mover.id,
        });

        return {
          isAssigned: mover.confirmationCount > 0,
          moverName: mover.nickname,
          profileImg: mover.profileImage,
          career: mover.career,
          confirmationCount: mover.confirmationCount,
          favoriteCount,
          serviceType: mover.serviceType,
          reviewStats: {
            averageScore,
            totalReviews,
          },
        };
      })
    );

    // 다음 페이지 여부 확인
    const hasNextPage = skip + take < totalFavorites;

    return {
      total: totalFavorites,
      hasNextPage,
      list: list.filter((item) => item !== null),
    };
  } catch (error) {
    throw new Error('찜한 기사님 목록을 불러오는 중 문제가 발생했습니다.');
  }
}