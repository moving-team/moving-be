import estimateRequestRepository from '../repositories/estimateRequestRepository';
import movingInfoRepository from '../repositories/movingInfoRepository';
import userRepository from '../repositories/userRepository';
import { CreateEstimateReq } from '../structs/estimateRequest-struct';
import { createEstimateReqMapper } from './mappers/estimateRequestMapper';
import { estimateReqSelect } from './selerts/estimateRequsetSelect';
import { movinginfoSelect } from './selerts/movingInfoSelect';
import { userCustomerSelect } from './selerts/userSelect';

// 견적 요청 작성 API
async function createEstimateReq(userId: number, data: CreateEstimateReq) {
  const user = await userRepository.findUniqueOrThrowtData({
    where: { id: userId },
    select: userCustomerSelect,
  });

  // 소비자 프로필 유무 확인
  // 프로필 생성방식이 정해지면 수정 가능
  if (!user.Customer) {
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

export default {
  createEstimateReq,
};
