import favoriteRepository from '../repositories/favoriteRepository';
import reviewRepository from '../repositories/reviewRepository';
import { reviewSelect } from '../services/selerts/reviewSelert';

export async function getMoverReviewStats(moverId: number) {
  // 총 리뷰 수 확인
  const totalReviews = await reviewRepository.countData({
    moverId,
  });
  let totalScore: number = 0;

  // 리뷰가 1개 이상일 시 리뷰 점수 총합 획득
  if (totalReviews !== 0) {
    const reviewList = await reviewRepository.findManyData({
      where: { moverId },
      select: reviewSelect,
    });
    totalScore = reviewList.reduce((sum, review) => sum + review.score, 0);
  }

  // 리뷰 평균 점수
  const averageScore = Math.round((totalScore / totalReviews) * 10) / 10;

  return { totalReviews, averageScore };
}

export async function getMoverFavoriteStats(
  moverId: number,
  customerId: number
) {
  // 찜된 횟수
  const favoriteCount = await favoriteRepository.countData({
    moverId,
  });

  const favorite = await favoriteRepository.findFirstData({
    where: { moverId, customerId },
  });

  // 찜 여부
  let isFavorite = false;
  if (favorite) {
    isFavorite = true;
  }

  return { favoriteCount, isFavorite };
}
