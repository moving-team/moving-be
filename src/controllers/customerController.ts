import * as customerService from '../services/customerService';
import { Request, Response, NextFunction } from 'express';



const getCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = (req as any).user as { id: number };
    const customer = await customerService.getCustomer(id);
    res.status(200).json(customer);
  } catch (err) {
    next(err);
  }
}

const patchCustomerProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = (req as any).user as { id: number };
    const profileImage = req.file ? (req.file as any).location : undefined;
  
    const updateData = {
      ...req.body,
      profileImage : profileImage
    };
    await customerService.patchCustomerProfile(id, updateData);
  } catch (err) {
    next(err);
    return;
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

export { patchCustomerProfileController, patchCustomerInfoController, getCustomerController };