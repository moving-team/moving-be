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

// 기사-확정된 견적 리스트 조회 API
async function findConfirmedEstimateList(
  req: Request<{}, {}, {}, { page?: string; pageSize?: string }>,
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
    const { page = '1', pageSize = '8' } = req.query;
    const pageSizeNum = parseInt(pageSize) || 8;
    const skip = parseInt(page) || 1;
    const take = (skip - 1) * pageSizeNum;

    const estimate = await estimateService.findConfirmedEstimateList(
      userId,
      skip,
      take
    );
    res.send(estimate);
  } catch (err) {
    return next(err);
  }
}
export default {
  findReceivedEstimateList,
  findConfirmedEstimateList,
};
