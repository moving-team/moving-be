import { NextFunction, Request, Response } from 'express';
import notificationService from '../services/notificationService';

// 이사 전날 확인 알람 생성 API
async function sendMovingDayReminder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await notificationService.sendMovingDayReminder();
    res.send({ success: true });
  } catch (err) {
    return next(err);
  }
}

export default { sendMovingDayReminder };
