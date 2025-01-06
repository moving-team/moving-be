import { Router } from 'express';
import { connectToNotifications, getUnreadNotifications, postNotificationMarkRead } from '../controllers/notificationController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// SSE 엔드포인트
router
  .route('/stream')
  .all(authenticateToken)
  .get(connectToNotifications);

router
  .route('/history')
  .all(authenticateToken)
  .get(getUnreadNotifications);

  router
  .route('/read/:notificationId')
  .all(authenticateToken)
  .post(postNotificationMarkRead);

export default router;
