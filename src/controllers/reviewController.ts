import { NextFunction, Request, Response } from 'express';
import { getReviews } from '../services/reviewService';
import { createReview } from '../services/reviewService';
import { getMyReviews } from '../services/reviewService';

// 리뷰 목록 및 통계 데이터를 반환
export async function getReviewsHandler(
  req: Request<{ moverId: string }, {}, {}, { page?: string; pageSize?: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { moverId } = req.params; // URL에서 Mover ID 가져오기
    const { page = '1', pageSize = '10' } = req.query; // 쿼리에서 정보 가져오기
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    // Service 호출
    const result = await getReviews(Number(moverId), skip, pageSizeNum);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// 리뷰 작성 API
export async function createReviewHandler(
  req: Request<{}, {}, { estimateId: number; moverId: number; score: number; content: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user || typeof req.user === 'string') {
      throw new Error('로그인이 필요한 서비스입니다.');
    }
    const customerId = req.user.id; // customoerID 가져오기
    const { estimateId, moverId, score, content: description } = req.body; // req body 가져오기

    // Service 불러오기
    const newReview = await createReview({ customerId, estimateId, moverId, score, description });

    res.status(201).json(newReview);
  } catch (err) {
    next(err);
  }
}


// 내 리뷰 가져오기
export async function getMyReviewsHandler(
  req: Request<{}, {}, {}, { page?: string; pageSize?: string }>,
  res: Response,
  next: NextFunction
) {
  try { // 예외 처리
    if (!req.user || typeof req.user === 'string') {
      throw new Error('로그인이 필요한 서비스입니다.');
    }

    const customerId = req.user.id; // 토큰에서 사용자 ID 가져오기

    const { page = '1', pageSize = '10' } = req.query; // 쿼리에서 정보 가져오기
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 10;
    const skip = (pageNum - 1) * pageSizeNum;

    // Service 불러오기
    const result = await getMyReviews(customerId, skip, pageSizeNum);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}