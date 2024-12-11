export function changeMovingDate(movingDate: Date) {
    return movingDate
      .toLocaleDateString('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '.');
  }
  
  export function changeRegion(region: string) {
    if (region.slice(0, 2) === '세종') {
      const parts = region.split(' ');
      return parts[1] === '세종시' ? `세종 ${parts[2]}` : `세종 ${parts[1]}`;
    } else if (region.slice(0, 2) === '제주') {
      const parts = region.split(' ');
      return `제주 ${parts[1]}`;
    } else if (region.slice(0, 2) === '강원') {
      const parts = region.split(' ');
      return `강원 ${parts[1]}`;
    } else if (region.slice(0, 2) === '전북') {
      const parts = region.split(' ');
      return `전북 ${parts[1]}`;
    } else {
      const parts = region.split(' ');
      return `${parts[0]} ${parts[1]}`;
    }
  }
  