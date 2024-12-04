export function checkIfMovingDateOver(movingDate: string) {
  // 현재 날짜
  const today = new Date();
  const koreanDate = today.toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });
  const [year, month, day] = koreanDate
    .split('.')
    .map((part) => parseInt(part.trim(), 10));

  // 이사 날짜
  const [movingInfoYear, movingInfoMonth, movingInfoDay] = movingDate
    .split('.')
    .map((part) => parseInt(part, 10));

  // 이사일이 지났는지 확인
  if (year > movingInfoYear) {
    // 연도가 지났을 때
    return true;
  } else if (year === movingInfoYear && month > movingInfoMonth) {
    // 달이 지났을 때
    return true;
  } else if (
    year === movingInfoYear &&
    month === movingInfoMonth &&
    day > movingInfoDay
  ) {
    // 일이 지났을때
    return true;
  }

  return false
}
