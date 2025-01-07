import express from 'express';
import userController from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/signup').post(userController.registerController);

router.route('/login').post(userController.loginController);

router.route('/logout').post(userController.logoutController);

router.route('/kakao').get(userController.kakaoLoginController);

router.route('/callback/kakao').get(userController.kakaoCallbackController);

router.route('/naver').get(userController.naverLoginController);

router.route('/callback/naver').get(userController.naverCallbackController);

router.route('/google').get(userController.googleLoginController);

router.route('/callback/google').get(userController.googleCallbackController);

router
  .route('/me')
  .all(authenticateToken)
  .get(userController.getUserController);

export default router;
