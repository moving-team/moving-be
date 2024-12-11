import express from 'express';
import { toggleFavoriteHandler } from '../controllers/favoriteController';
import { authenticateToken } from '../middlewares/authMiddleware';

const favoriteRouter = express.Router();

// 찜 토글
favoriteRouter
    .route('')
    .all(authenticateToken)
    .post(toggleFavoriteHandler)

export default favoriteRouter;
