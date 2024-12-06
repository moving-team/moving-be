// 랜덤 가격 생성 함수
export function getWeightedRandomPrice(
  min: number,
  max: number,
  breakpoint: number,
  highWeight: number
): number {
  const isBelowBreakpoint = Math.random() < highWeight;
  const price = isBelowBreakpoint
    ? Math.random() * (breakpoint - min + 1) + min
    : Math.random() * (max - breakpoint + 1) + breakpoint;
  return Math.round(price / 10000) * 10000;
}

// MovingType에 따른 가격 생성
export function getPriceByMovingType(movingType: 'SMALL' | 'HOUSE' | 'OFFICE'): number {
  switch (movingType) {
    case 'SMALL':
      return getWeightedRandomPrice(90000, 500000, 300000, 0.7);
    case 'HOUSE':
      return getWeightedRandomPrice(250000, 1000000, 600000, 0.6);
    case 'OFFICE':
      return getWeightedRandomPrice(500000, 1500000, 700000, 0.3);
    default:
      throw new Error(`Invalid movingType: ${movingType}`);
  }
}