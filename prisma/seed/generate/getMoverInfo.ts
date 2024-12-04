

import { moverList } from '../dummyList/crawlingMoverList';

export type Mover = {
  name: string;
  introduction: string;
  description: string;
};

let usedMoverInfo: Mover[] = []; // 사용된 MoverInfo를 저장하는 배열

export function getRandomMoverInfo(): Mover {
  const availableMoverInfo = moverList.filter(
      (moverInfo) => !usedMoverInfo.includes(moverInfo)
  );

  if (availableMoverInfo.length === 0) {
      usedMoverInfo = [];
      return getRandomMoverInfo();
  }

  const randomIndex = Math.floor(Math.random() * availableMoverInfo.length);
  const selectedMoverInfo = availableMoverInfo[randomIndex];

  usedMoverInfo.push(selectedMoverInfo);

  return selectedMoverInfo;
}

// 테스트
const test = getRandomMoverInfo();
if (test) {
  console.log(test.name);
  console.log(test.introduction);
  console.log(test.description);
} else {
  console.error("No data returned from getRandomMoverInfo.");
}
