import { responseComments } from '../dummyList/resCommentList';

let usedResponseComments: string[] = [];

export function getRandomResponseComment(): string {
  const availableComments = responseComments.filter(
    (comment: string) => !usedResponseComments.includes(comment)
  );

  if (availableComments.length === 0) {
    usedResponseComments = [];
    return getRandomResponseComment();
  }

  const randomIndex = Math.floor(Math.random() * availableComments.length);
  const selectedComment = availableComments[randomIndex];

  usedResponseComments.push(selectedComment); // 사용된 코멘트 기록

  return selectedComment;
}

console.log(getRandomResponseComment());
