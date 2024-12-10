import express from 'express';
import { getReviewsHandler, createReviewHandler, getMyReviewsHandler } from '../controllers/reviewController';
import { authenticateToken } from '../middlewares/authMiddleware';

const reviewRouter = express.Router();

// 리뷰 목록 조회
reviewRouter
    .route('/:moverId')
    .get(getReviewsHandler);

// 리뷰 작성 (auth 토큰으로 접근 보호)
reviewRouter
    .route('/')
    .all(authenticateToken)
    .post(createReviewHandler);

// 내 리뷰 목록 조회
reviewRouter
    .route('/review/me')
    .all(authenticateToken)
    .get(getMyReviewsHandler)

export default reviewRouter;
