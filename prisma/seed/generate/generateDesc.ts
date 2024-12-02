import { descList } from '../dummyList/descList';

let usedDescriptions: string[] = [];

export function getDesc(): string {
  const availableDescriptions = descList.filter(
    (description) => !usedDescriptions.includes(description)
  );

  if (availableDescriptions.length === 0) {
    usedDescriptions = [];
    return getDesc();
  }

  const randomIndex = Math.floor(Math.random() * availableDescriptions.length);
  const selectedDescription = availableDescriptions[randomIndex];

  usedDescriptions.push(selectedDescription); // 선택된 description 기록

  return selectedDescription;
}