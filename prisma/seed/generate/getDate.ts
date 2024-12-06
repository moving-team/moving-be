

export function getRadomDate(): Date {
  const startDate = new Date('2024-11-24T00:00:00');
  const endDate = new Date('2025-01-14T23:59:59');
  if (startDate >= endDate) {
    throw new Error('startDate must be earlier than endDate');
  }

  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  const randomTimestamp = Math.floor(
    Math.random() * (endTimestamp - startTimestamp + 1) + startTimestamp
  );

  return new Date(randomTimestamp);
}


export function getRecentRandomDate(): string {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * 30);
  const randomDate = new Date(today);
  randomDate.setDate(today.getDate() - randomDays);
  return randomDate.toISOString().split('T')[0];
}

// 테스트
// console.log(getBeforeDate());
// console.log(getRadomDate());