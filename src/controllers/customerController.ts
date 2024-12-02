import * as customerService from '../services/customerService';
import { Request, Response, NextFunction } from 'express';


const patchCustomerProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = (req as any).user as { id: number };
    await customerService.patchCustomerProfile(id, req.body);
  } catch (err) {
    next(err);
  }
  res.status(200).json({ message: '수정 완료' });
}

const patchCustomerInfoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = (req as any).user as { id: number };
    await customerService.patchCustomerInfo(id, req.body);
    res.status(200).json({ message: '수정 완료' });
  } catch (err) {
    next(err);
  }
  
}

export { patchCustomerProfileController, patchCustomerInfoController };