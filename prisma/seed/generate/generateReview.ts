import { reveiwList } from '../dummyList/reviewList';

let usedReview: string[] = [];

export function getRandomReview(): string {
  const availableReview = reveiwList.filter(
    (reivew) => !usedReview.includes(reivew)
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

console.log(getRandomReview());