import { rejectionReasons } from '../dummyList/rejectReasonList';

let usedRejectionReasons: string[] = [];

export function getRandomRejectionReason(): string {
  const availableReasons = rejectionReasons.filter(
    (reason: string) => !usedRejectionReasons.includes(reason)
  );

  if (availableReasons.length === 0) {
    usedRejectionReasons = [];
    return getRandomRejectionReason();
  }

  const randomIndex = Math.floor(Math.random() * availableReasons.length);
  const selectedReason = availableReasons[randomIndex];

  usedRejectionReasons.push(selectedReason); // 선택된 이유 기록

  return selectedReason;
}

// 테스트
// console.log(getRandomRejectionReason());
