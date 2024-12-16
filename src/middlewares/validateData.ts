import { NextFunction, Request, Response } from 'express';
import {
  createEstimateReq,
  CreateEstimateReq,
} from '../structs/estimateRequest-struct';
import { assert } from 'superstruct';
import { createEstimate, CreateEstimate } from '../structs/estimate-struct';

export async function validateEstimateReq(
  req: Request<{}, {}, CreateEstimateReq>,
  res: Response,
  next: NextFunction
) {
  try {
    assert(req.body, createEstimateReq);
    return next();
  } catch (err) {
    return next(err);
  }
}

export async function validateEstimate(
  req: Request<{}, {}, CreateEstimate>,
  res: Response,
  next: NextFunction
) {
  try {
    assert(req.body, createEstimate);
    return next();
  } catch (err) {
    return next(err);
  }
}
