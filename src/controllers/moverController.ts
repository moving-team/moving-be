import * as moverService from '../services/moverService';
import { Request, Response, NextFunction } from 'express';


const getMoverDetailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = (req as any).user as { id: number };
    const moverId = parseInt(req.params.moverId, 10);
    const mover = await moverService.getMoverDetail(id, moverId);
    res.status(200).json(mover);
  } catch (err) {
    next(err);
  }
}

const getMoverController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = (req as any).user as { id: number };
    const mover = await moverService.getMover(id);
    res.status(200).json(mover);
  } catch (err) {
    next(err);
  }
}

const patchMoverProfileController = async (
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
    await moverService.patchMoverProfile(id, updateData);
  } catch (err) {
    next(err);
  }
  res.status(200).json({ message: '수정 완료' });
}

export { patchMoverProfileController, getMoverController,getMoverDetailController };