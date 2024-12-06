import { requestComment } from '../dummyList/estimateRequestCommentList';

let usedComment: string[] = [];

export function getRandomComment(): string {
  const availableComment = requestComment.filter(
    (comment:string) => !usedComment.includes(comment)
  );

  if (availableComment.length === 0) {
    usedComment = [];
    return getRandomComment();
  }

  const randomIndex = Math.floor(Math.random() * availableComment.length);
  const selectedComment = availableComment[randomIndex];

  usedComment.push(selectedComment); // 선택된 Introduce 기록

 
  return selectedComment;
}

// 테스트
// console.log(getRandomComment());