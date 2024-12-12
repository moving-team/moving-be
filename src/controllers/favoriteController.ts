import { Request, Response, NextFunction } from 'express';
import { toggleFavorite } from '../services/favoriteService';

export async function toggleFavoriteHandler(
  req: Request<{}, {}, { moverId: number }>,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user || typeof req.user === 'string') {
      throw new Error('로그인이 필요한 서비스입니다.');
    }
    const customerId = req.user.id;
    const { moverId } = req.body;
    
    // Service 연결
    const result = await toggleFavorite(customerId, moverId);

    res.status(200).json(result);
  } catch (err) {
    next(err); 
  }
}