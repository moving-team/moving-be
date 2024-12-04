const serviceTypes = ['SMALL', 'HOUSE', 'OFFICE'];

// 배열에서 랜덤 값을 반환
function getRandomValue<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// 랜덤크기 배열 설정
function getRandomArray<T>(array: T[], maxSize: number): T[] {
  const size = Math.max(1, Math.floor(Math.random() * (maxSize + 1))); 
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
}

// 가중치 
function getWeightedRandomArray<T>(array: T[], maxSize: number): T[] {
  const weights = [0.6, 0.3, 0.1];
  const cumulativeWeights = weights.map(
    ((sum) => (weight) => (sum += weight))(0)
  );

  const random = Math.random();

  // 가중치 배열
  const size =
    cumulativeWeights.findIndex((cumulativeWeight) => random <= cumulativeWeight) +
    1;

  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(size, maxSize));
}

// 단일 서비스 타입 반환
export function getServiceTypes(): string {
  return getRandomValue(serviceTypes);
}

// 기존 방식으로 랜덤 배열 반환
export function getServiceTypesArray(): string[] {
  return getRandomArray(serviceTypes, serviceTypes.length);
}

// 가중치 방식으로 랜덤 배열 반환
export function getWeightedServiceTypesArray(): string[] {
  return getWeightedRandomArray(serviceTypes, serviceTypes.length);
}

// 테스트
// console.log('Single Service Type:', getServiceTypes());
// console.log('Random Array:', getServiceTypesArray());
// console.log('Weighted Random Array:', getWeightedServiceTypesArray());
