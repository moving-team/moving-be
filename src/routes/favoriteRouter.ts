import express from 'express';
import { toggleFavoriteHandler, getFavoriteMoversHandler  } from '../controllers/favoriteController';
import { authenticateToken } from '../middlewares/authMiddleware';

const favoriteRouter = express.Router();

// 찜 토글
favoriteRouter
    .route('')
    .all(authenticateToken)
    .post(toggleFavoriteHandler)

// 찜 list
favoriteRouter
    .route('/me')
    .all(authenticateToken)
    .get(getFavoriteMoversHandler)

export default favoriteRouter;
