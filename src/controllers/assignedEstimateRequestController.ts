import { NextFunction, Request, Response } from 'express';
import assignedEstimateRequestService from '../services/assignedEstimateRequestService';

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
      throw new Error('권한이 없습니다.');
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

export default { createAssigned };
