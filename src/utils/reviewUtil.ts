import { ReviewStats } from '../types/serviceType';

export function calculateReviewStats(reviews: { score: number }[]): ReviewStats {
  const reviewCount: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach((review) => {
    const score = review.score as 1 | 2 | 3 | 4 | 5; 
    if (score >= 1 && score <= 5) {
      reviewCount[score]++;
    }
  });

  const totalReviews = reviews.length;

  return { totalReviews, reviewCount };
}
