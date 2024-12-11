import express from 'express';
import { getReviewsHandler, createReviewHandler, getMyReviewsHandler } from '../controllers/reviewController';
import { authenticateToken } from '../middlewares/authMiddleware';

const reviewRouter = express.Router();

// 내 리뷰 목록 조회
reviewRouter
    .route('/me')
    .all(authenticateToken)
    .get(getMyReviewsHandler)

// 리뷰 작성 (auth 토큰으로 접근 보호)
reviewRouter
    .route('/')
    .all(authenticateToken)
    .post(createReviewHandler);

// 리뷰 목록 조회 // 동적 라우터가 먼저 라우팅 되는 문제가 있었음
reviewRouter
    .route('/:moverId')
    .get(getReviewsHandler);

export default reviewRouter;
