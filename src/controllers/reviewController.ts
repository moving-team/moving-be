import { NextFunction, Request, Response } from 'express';
import { getReviews } from '../services/reviewService';
import { createReview } from '../services/reviewService';

// 리뷰 목록 및 통계 데이터를 반환하는 컨트롤러 함수
export async function getReviewsHandler(
  req: Request<{ moverId: string }, {}, {}, { page?: string; pageSize?: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { moverId } = req.params; // URL에서 Mover ID 가져오기
    const { page = '1', pageSize = '10' } = req.query; // 쿼리에서 페이지네이션 정보 가져오기

    // 쿼리 파라미터를 숫자로 변환
    const pageNum = parseInt(page, 10) || 1; // 페이지 번호 기본값 1
    const pageSizeNum = parseInt(pageSize, 10) || 10; // 페이지 크기 기본값 10
    const skip = (pageNum - 1) * pageSizeNum; // 스킵할 데이터 계산

    // 서비스 계층 호출하여 리뷰 목록과 통계 데이터 가져오기
    const result = await getReviews(Number(moverId), skip, pageSizeNum);

    // 결과를 JSON 형식으로 클라이언트에 응답
    res.status(200).json(result);
  } catch (err) {
    // 에러 발생 시 에러 처리 미들웨어로 전달
    next(err);
  }
}

// 리뷰 작성 API
export async function createReviewHandler(
  req: Request<{}, {}, { estimateId: number; moverId: number; score: number; description: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    // req.user에서 인증된 사용자 정보를 가져옴 (customerId)
    if (!req.user || typeof req.user === 'string') {
      throw new Error('인증된 사용자만 리뷰를 작성할 수 있습니다.');
    }
    const customerId = req.user.id;

    // req.body에서 리뷰 작성 정보를 가져옴
    const { estimateId, moverId, score, description } = req.body;

    // 서비스 계층 호출하여 리뷰 생성
    const newReview = await createReview({ customerId, estimateId, moverId, score, description });

    // 생성된 리뷰를 응답
    res.status(201).json(newReview);
  } catch (err) {
    next(err);
  }
}