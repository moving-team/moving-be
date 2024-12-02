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
    const { userId } = req.auth;
    const estimateReq = await estimateRequestService.createEstimateReq(
      userId,
      req.body
    );
    res.status(201).send(estimateReq);
  } catch (err) {
    return next(err);
  }
}

export default {
  createEstimateReq,
};
