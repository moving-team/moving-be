const serviceTypes = ['SMALL', 'HOUSE', 'OFFICE'];

function getRandomValue<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function getRandomArray<T>(array: T[], maxSize: number): T[] {
  const size = Math.floor(Math.random() * (maxSize + 1));
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
}


export function getServiceTypes(): string {
  return getRandomValue(serviceTypes);
}

export function getServiceTypesArray(): string[] {
  return getRandomArray(serviceTypes, serviceTypes.length);
}

console.log(getServiceTypes());
console.log(getServiceTypesArray());


