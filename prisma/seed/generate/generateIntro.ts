import { introList } from '../dummyList/introList';

let usedIntroduce: string[] = [];

export function getRandomIntro(): string {
  const availableIntroduce = introList.filter(
    (intro) => !usedIntroduce.includes(intro)
  );

  if (availableIntroduce.length === 0) {
    usedIntroduce = [];
    return getRandomIntro();
  }

  const randomIndex = Math.floor(Math.random() * availableIntroduce.length);
  const selectedIntroduce = availableIntroduce[randomIndex];

  usedIntroduce.push(selectedIntroduce); // 선택된 Introduce 기록

  return selectedIntroduce;
}

//test
console.log(getRandomIntro());