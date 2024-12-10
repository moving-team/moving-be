// Mover description 기반 가중치 확률 설정
export function getMoverAcceptRate(movers: any[]): Map<number, number> {
  const sortedMovers = movers.sort((a, b) => b.description.length - a.description.length);
  const moverAcceptRate = new Map<number, number>();

  const maxAcceptRate = 0.23; // 1위: 23%
  const secondAcceptRate = 0.10; // 2위: 10%
  const minAcceptRate = 0.005; // 최소 확률: 0.5%

  const decreaseFactor = (secondAcceptRate - minAcceptRate) / (movers.length - 2);

  sortedMovers.forEach((mover, index) => {
    let acceptRate: number;

    if (index === 0) {
      acceptRate = maxAcceptRate; // 1위
    } else if (index === 1) {
      acceptRate = secondAcceptRate; // 2위
    } else {
      acceptRate = Math.max(secondAcceptRate - (index - 1) * decreaseFactor, minAcceptRate);
    }

    moverAcceptRate.set(mover.id, acceptRate);
  });

  return moverAcceptRate;
}