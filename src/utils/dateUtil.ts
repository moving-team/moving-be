export function todayUTC() {
  const today = new Date();
  const koreanTimeString = today.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });
  const [year, month, day] = koreanTimeString
    .split('.')
    .map((part) => parseInt(part.trim(), 10));
  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');

  const newtoday = new Date(
    `${year}-${paddedMonth}-${paddedDay}T00:00:00+09:00`
  );
  return newtoday.toISOString();
}
