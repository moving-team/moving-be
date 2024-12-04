const regions = [
  'SEOUL',
  'GYEONGGI',
  'INCHEON',
  'GANGWON',
  'CHUNGBUK',
  'CHUNGNAM',
  'SEJONG',
  'DAEJEON',
  'JEONBUK',
  'JEONNAM',
  'GWANGJU',
  'GYEONGBUK',
  'GYEONGNAM',
  'DAEGU',
  'ULSAN',
  'BUSAN',
  'JEJU',
];


function getRandomValue<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function getRandomArray<T>(array: T[], maxSize: number): T[] {
  const size = Math.max(1, Math.floor(Math.random() * (maxSize + 1))); 
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
}



export function getRegion(): string {
  return getRandomValue(regions);
}

export function getRegionArray(): string[] {
  return getRandomArray(regions, regions.length);
}

console.log(getRegion());
console.log(getRegionArray());
