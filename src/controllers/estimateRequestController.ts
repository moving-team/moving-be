import { NextFunction, Request, Response } from 'express';
import { CreateEstimateReq } from '../structs/estimateRequest-struct';
import estimateRequestService from '../services/estimateRequestService';

// 견적 요청 작성 API
async function createEstimateReq(
  req: Request<{}, {}, CreateEstimateReq>,
  res: Response,
  next: NextFunction
) {
  try {
    if (
      req.user &&
      typeof req.user !== 'string' &&
      typeof req.user.id === 'number'
    ) {
      const { id: userId } = req.user;
      const estimateReq = await estimateRequestService.createEstimateReq(
        userId,
        req.body
      );
      res.status(201).send(estimateReq);
    }

    throw new Error('로그인 해주세요');
  } catch (err) {
    return next(err);
  }
}

export default {
  createEstimateReq,
};
