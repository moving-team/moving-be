import express from 'express';
import { getReviewsHandler, createReviewHandler } from '../controllers/reviewController';
import { authenticateToken } from '../middlewares/authMiddleware';

const reviewRouter = express.Router();

// 리뷰 목록 조회
reviewRouter.get('/:moverId', getReviewsHandler);

// 리뷰 작성 (auth 토큰으로 접근 보호)
reviewRouter.post('/', authenticateToken, createReviewHandler);

export default reviewRouter;
