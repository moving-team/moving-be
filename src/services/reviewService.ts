import reviewRepository from '../repositories/reviewRepository';
import { calculateReviewStats } from '../utils/reviewUtil'
import { CreateReviewInput } from '../types/serviceType';
import { reviewListSelect, myReviewSelect } from './selects/reviewSelect';

// GET Review
export async function getReviews(moverId: number, skip: number, take: number) {
  // 리뷰 목록 가져오기
  const reviews = await reviewRepository.findManyByPaginationData({
    paginationParams: { skip, take, where: { moverId } },
    select: reviewListSelect,
  });

  // 리뷰 통계 계산
  const allReviews = await reviewRepository.findManyData({
    where: { moverId },
    select: { score: true },
  });

  // 리뷰별 통계 계산 (유틸 함수 적용)
  const stats = calculateReviewStats(allReviews);

  // 다음 페이지가 있는지 확인 (전체 리뷰 수와 현재 페이지의 리뷰 수로 계산)
  const hasNextPage = allReviews.length > skip + take;

  // 리뷰 목록 데이터 포맷팅
  const formattedReviews = reviews.map((review) => ({
    reviewId: review.id,
    customerName: review.Customer?.User.name,
    createAt: review.createdAt,
    score: review.score,
    content: review.description,
  }));

  return {
    reviewStats: stats,
    reviews: {
      hasNextPage,
      list: formattedReviews,
    },
  };
}


// POST Review
export async function createReview(input: CreateReviewInput) {
  const { customerId, estimateId, moverId, score, description } = input;

  // 리뷰 중복 여부 확인
  const existingReview = await reviewRepository.findFirstData({
    where: { estimateId },
  });

  if (existingReview) {
    throw new Error('이미 해당 견적에 대한 리뷰가 작성되었습니다.');
  }

  // 리뷰 생성
  const newReview = await reviewRepository.createData({
    data: {
      customerId,
      estimateId,
      moverId,
      score,
      description,
    },
    select: {
      id: true,
      estimateId: true,
      moverId: true,
      score: true,
      description: true,
      createdAt: true,
    },
  });

  return newReview;
}

// GET reivew/me
export async function getMyReviews(customerId: number, skip: number, take: number) {
  // 사용자 작성 리뷰 목록 조회
  const myReviews = await reviewRepository.findManyByPaginationData({
    paginationParams: { skip, take, where: { customerId } },
    select: myReviewSelect,
  });


  // 전체 리뷰 개수 가져오기
  const totalReviews = await reviewRepository.countData({
    customerId,
  });

  // 다음 페이지 여부 확인
  const hasNextPage = skip + take < totalReviews;

  // 리뷰 목록 데이터 매핑
  const formattedReviews = myReviews.map((review) => ({
    reviewId: review.id,
    moverId: review.Mover.id,
    moverName: review.Mover.nickname,
    profileImg: review.Mover.profileImage || '',
    score: review.score,
    content: review.description,
    createAt: review.createdAt,
    price: review.Estimate?.price,
    isAssigned: review.Estimate.isAssigned,
    movingType: review.Estimate.MovingInfo.movingType,
    movingDate: review.Estimate.MovingInfo.movingDate,
  }));

  return {
    total: totalReviews,
    hasNextPage,
    list: formattedReviews,
  };
};
