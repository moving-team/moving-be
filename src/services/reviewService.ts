import reviewRepository from '../repositories/reviewRepository';
import { calculateReviewStats } from '../utils/reviewUtil';
import { CreateReviewInput } from '../types/serviceType';

// GET Review
export async function getReviews(moverId: number, skip: number, take: number) {
  // 리뷰 목록 가져오기
  const reviews = await reviewRepository.findManyByPaginationData({
    paginationParams: { skip, take, where: { moverId } },
    select: {
      id: true,
      score: true,
      description: true,
      createdAt: true,
      Customer: {
        select: {
          User: { select: { name: true } },
        },
      },
    },
  });

  // 리뷰 통계 계산
  const allReviews = await reviewRepository.findManyData({
    where: { moverId },
    select: { score: true },
  });

  const stats = calculateReviewStats(allReviews);

  return {
    reviewStats: stats,
    list: reviews.map((review) => ({
      id: review.id,
      writer: review.Customer?.User.name,
      createAt: review.createdAt,
      score: review.score,
      content: review.description,
    })),
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