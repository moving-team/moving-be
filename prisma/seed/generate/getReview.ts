import { reviewList } from '../dummyList/crawlingReviewList';

let usedReview: string[] = [];

export function getRandomReview(): string {
  const availableReview = reviewList.filter(
    (review) => !usedReview.includes(review)
  );

  if (availableReview.length === 0) {
    usedReview = [];
    return getRandomReview();
  }

  const randomIndex = Math.floor(Math.random() * availableReview.length);
  const selectedReview = availableReview[randomIndex];

  usedReview.push(selectedReview); // 선택된 Introduce 기록

 
  return selectedReview;
}

// 테스트
// console.log(getRandomReview());