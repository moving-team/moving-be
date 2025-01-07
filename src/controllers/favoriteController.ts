import { Request, Response, NextFunction } from 'express';
import { toggleFavorite, getFavoriteMovers } from '../services/favoriteService';
import { getCustomerId } from '../services/userService';

export async function toggleFavoriteHandler(
  req: Request<{}, {}, { moverId: number }>,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user || typeof req.user === 'string') {
      throw new Error('로그인이 필요한 서비스입니다.');
    }
    const userId = req.user.id; 
    const { moverId } = req.body;

    // 서비스 연결 
    const customerId = await getCustomerId(userId); // customerID 조회
    const result = await toggleFavorite(customerId, moverId);

    res.status(200).json(result);
  } catch (err) {
    next(err); 
  }
}

export async function getFavoriteMoversHandler(
  req: Request<{}, {}, {}, { page?: string; pageSize?: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    // 사용자 인증 정보 확인
    if (!req.user || typeof req.user === 'string') {
      throw new Error('인증된 사용자만 접근 가능합니다.');
    }
    const userId = req.user.id; //customer ID 찾기 필요

    // 페이지네이션 정보 가져오기
    const { page = '1', pageSize = '10' } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    // 서비스 연결 
    const customerId = await getCustomerId(userId); // customerID 조회
    const result = await getFavoriteMovers(customerId, skip, pageSizeNum);

    // 결과 응답
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}