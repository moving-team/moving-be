import { NextFunction, Request, Response } from 'express';
import estimateService from '../services/estimateService';
import { CreateEstimate } from '../structs/estimate-struct';
import { CustomError } from '../middlewares/errHandler';

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
      const err: CustomError = new Error('권한이 없습니다.');
      err.status = 401;
      throw err;
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
      const err: CustomError = new Error('권한이 없습니다.');
      err.status = 401;
      throw err;
    }

    const { id: userId } = req.user;
    const { page = '1', pageSize = '8' } = req.query;
    const pageNum = parseInt(page) || 1;
    const take = parseInt(pageSize) || 8;
    const skip = (pageNum - 1) * take;

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

// 기사-보냈 견적 리스트 조회 API
async function findSentEstimateList(
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
      const err: CustomError = new Error('권한이 없습니다.');
      err.status = 401;
      throw err;
    }

    const { id: userId } = req.user;
    const { page = '1', pageSize = '8' } = req.query;
    const pageNum = parseInt(page) || 1;
    const take = parseInt(pageSize) || 8;
    const skip = (pageNum - 1) * take;

    const estimate = await estimateService.findSentEstimateList(
      userId,
      skip,
      take
    );
    res.send(estimate);
  } catch (err) {
    return next(err);
  }
}

// 유저-대기중인 견적 조회 API
async function findWatingEstimateList(
  req: Request,
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
    const estimate = await estimateService.findWatingEstimateList(userId);
    res.send(estimate);
  } catch (err) {
    return next(err);
  }
}

// 유저-견적 확정 API
async function updateConfirmEstimate(
  req: Request<{ estimateId: string }, {}, {}>,
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
    const { estimateId } = req.params;
    const estimateIdNum = parseInt(estimateId, 10);

    const estimate = await estimateService.updateConfirmEstimate(
      userId,
      estimateIdNum
    );
    res.send(estimate);
  } catch (err) {
    return next(err);
  }
}

// 기사-견적 작성 API
async function createEstimate(
  req: Request<{}, {}, CreateEstimate>,
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
    const estimate = await estimateService.createEstimate(userId, req.body);
    res.status(201).send(estimate);
  } catch (err) {
    return next(err);
  }
}

// 견적 상세 조회 API
async function findEstimateDetail(
  req: Request<{ estimateId: string }, {}, {}>,
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
    const estimateId = parseInt(req.params.estimateId);
    const estimate = await estimateService.findEstimateDetail(
      userId,
      estimateId
    );
    res.send(estimate);
  } catch (err) {
    return next(err);
  }
}

// 유저-이사 완료한 견적 리스트 조회 API
async function findMovingCompleteList(
  req: Request<{}, {}, {}, { page: string; pageSize: string }>,
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
    const { page = '1', pageSize = '8' } = req.query;
    const pageNum = parseInt(page) || 1;
    const take = parseInt(pageSize) || 6;
    const skip = (pageNum - 1) * take;

    const estimate = await estimateService.findMovingCompleteList(
      userId,
      take,
      skip
    );
    res.send(estimate);
  } catch (err) {
    return next(err);
  }
}

export default {
  findReceivedEstimateList,
  findConfirmedEstimateList,
  findSentEstimateList,
  findWatingEstimateList,
  updateConfirmEstimate,
  createEstimate,
  findEstimateDetail,
  findMovingCompleteList,
};
