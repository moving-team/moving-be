import { NextFunction, Request, Response } from 'express';
import assignedEstimateRequestService from '../services/assignedEstimateRequestService';
import { CustomError } from '../middlewares/errHandler';

// 유저-지정 견적 요청 API
async function createAssigned(
  req: Request<{}, {}, { moverId: number }>,
  res: Response,
  next: NextFunction
) {
  try {
    if (
      !req.user ||
      typeof req.user === 'string' ||
      typeof req.user.id !== 'number'
    ) {
      const err: CustomError = new Error('권한이 없습니다.');
      err.status = 401;
      throw err;
    }

    const { id: userId } = req.user;
    const { moverId } = req.body;

    const assignedEstimateReq =
      await assignedEstimateRequestService.createAssigned(userId, moverId);

    res.status(201).send(assignedEstimateReq);
  } catch (err) {
    return next(err);
  }
}

// 기사 - 지정 견적 반려 API
async function rejectedAssigned(
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
      const err: CustomError = new Error('권한이 없습니다.');
      err.status = 401;
      throw err;
    }

    const { id: userId } = req.user;
    const estimateReqId = parseInt(req.params.estimateRequestId);
    const assignedEstimateReq =
      await assignedEstimateRequestService.rejectedAssigned(
        userId,
        estimateReqId
      );

    res.send(assignedEstimateReq);
  } catch (err) {
    return next(err);
  }
}
export default { createAssigned, rejectedAssigned };
