import estimateRequestRepository from '../repositories/estimateRequestRepository';
import movingInfoRepository from '../repositories/movingInfoRepository';
import userRepository from '../repositories/userRepository';
import { CreateEstimateReq } from '../structs/estimateRequest-struct';
import { createEstimateReqMapper } from './mappers/estimateRequestMapper';
import {
  estimateReqCustomerSelect,
  estimateReqSelect,
} from './selerts/estimateRequsetSelect';
import { movinginfoSelect } from './selerts/movingInfoSelect';
import { userCustomerSelect } from './selerts/userSelect';

// 견적 요청 작성 API
async function createEstimateReq(userId: number, data: CreateEstimateReq) {
  const user = await userRepository.findUniqueOrThrowtData({
    where: { id: userId },
    select: userCustomerSelect,
  });

  // 소비자 프로필 유무 확인
  if (!user.Customer || user.Customer?.region === 'NULL') {
    const error = new Error('프로필을 등록 해주세요');
    throw error;
  }

  // 이사 정보 생성
  const { comment, ...rest } = data;
  const movingInfo = await movingInfoRepository.createData({
    data: rest,
    select: movinginfoSelect,
  });

  // 견적 요청 생성
  const estimateReq = await estimateRequestRepository.createData({
    data: {
      customerId: user.Customer.id,
      movingInfoId: movingInfo.id,
      comment,
    },
    select: estimateReqSelect,
  });

  return createEstimateReqMapper(user.name, movingInfo, estimateReq);
}

// 견적 요청 삭제 API
async function deleteEstimateReq(userId: number, estimateRequestId: number) {
  const estimateReq = await estimateRequestRepository.findFirstData({
    where: { id: estimateRequestId },
    select: estimateReqCustomerSelect,
  });

  const user = await userRepository.findUniqueOrThrowtData({
    where: { id: userId },
    select: userCustomerSelect,
  });

  // 견적 요청 유무 확인
  if (!estimateReq) {
    throw new Error('존재하지 않는 견적 요청입니다.');
  } else if (estimateReq.isCancelled) {
    throw new Error('이미 취소된 요청입니다.');
  }

  // 권한 확인
  if (user.Customer && user.Customer.id !== estimateReq?.Customer.id) {
    throw new Error('권한이 없습니다.');
  }

  // 취소 여부 수정
  const deleteEstimateReq = await estimateRequestRepository.updateData({
    where: { id: estimateRequestId },
    data: { isCancelled: true },
    select: estimateReqSelect,
  });

  // 취소 여부가 변경이 안됐을 때
  if (!deleteEstimateReq.isCancelled) {
    throw new Error('다시 시도해 주세요.');
  }

  return {
    id: deleteEstimateReq.id,
    isCancelled: deleteEstimateReq.isCancelled,
  };
}

export default {
  createEstimateReq,
  deleteEstimateReq,
};
