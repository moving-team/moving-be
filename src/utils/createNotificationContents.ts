import { $Enums } from '@prisma/client';
import { changeRegion } from './mapperUtil';

type CreateContentsType = {
  type: 'confirm' | 'writen' | 'assign' | 'reject' | 'cancel' | '1-day';
  customerName?: string;
  moverName?: string;
  movingType?: $Enums.serviceType;
  departure?: string;
  arrival?: string;
};

export function createNotificationContents({
  type,
  customerName,
  moverName,
  movingType,
  departure,
  arrival,
}: CreateContentsType) {
  let newMovingType = '소형 이사';

  if (movingType === 'SMALL') {
    newMovingType = '소형 이사';
  } else if (movingType === 'HOUSE') {
    newMovingType = '가정 이사';
  } else if (movingType === 'OFFICE') {
    newMovingType = '사무실 이사';
  }

  if (type === 'confirm') {
    // 견적 확정
    return `${customerName} 고객님이 ${moverName} 기사님의 견적을 확정 선택 하셨습니다.`;
  } else if (type === 'writen') {
    // 견적 작성
    return `${moverName} 기사님의 ${newMovingType} 견적이 도착했습니다.`;
  } else if (type === 'assign') {
    // 지정 견적 요청
    return `${customerName} 고객님께서 ${newMovingType} 견적 요청을 지정하셨습니다.`;
  } else if (type === 'reject') {
    // 지정 요청 반려
    return `${moverName} 기사님께서 ${newMovingType} 견적 요청을 반려 하였습니다.`;
  } else if (type === 'cancel') {
    // 견적 요청 취소
    return `${customerName} 고객님께서 ${newMovingType} 견적 요청을 취소하였습니다.`;
  } else if (type === '1-day') {
    // 이사일 전날
    return `내일은 ${changeRegion(departure as string)} -> ${changeRegion(
      arrival as string
    )} 이사 예정일이에요`;
  }
}
