import { NextFunction, Request, Response } from 'express';
import estimateService from '../services/estimateService';

// 유저-받았던 견적 리스트 조회 API
async function findReceivedEstimateList(
  req: Request<{ estimateRequestId: string }, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    if (
      !req.user ||
      typeof req.user === 'string' ||
      typeof req.user.id !== 'number'
    ) {
      throw new Error('다시 시도해 주세요');
    }
    const { id: userId } = req.user;
    const estimateReqId = parseInt(req.params.estimateRequestId);
    const estimateList = await estimateService.findReceivedEstimateList(
      userId,
      estimateReqId
    );
    res.send(estimateList);
  } catch (err) {
    return next(err);
  }
}

export default {
  findReceivedEstimateList,
};
