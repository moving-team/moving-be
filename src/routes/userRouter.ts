import express from 'express';
import userController from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';


const router = express.Router();

router
  .route('/signup')
  .post(userController.registerController);

router
  .route('/login')
  .post(userController.loginController)

router
  .route('/logout')
  .post(userController.logoutController);

router
  .route('/me')
  .all(authenticateToken)
  .get(userController.getUserController);


export default router;
