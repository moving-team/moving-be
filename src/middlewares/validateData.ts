import { NextFunction, Request, Response } from 'express';
import {
  createEstimateReq,
  CreateEstimateReq,
} from '../structs/estimateRequest-struct';
import { assert } from 'superstruct';

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
