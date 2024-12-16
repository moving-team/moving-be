import express from 'express';
import * as moverController from '../controllers/moverController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { uploadImage } from '../middlewares/uploadMiddleware';

const router = express.Router();

router
  .route('/profile')
  .all(authenticateToken)
  .patch(
    uploadImage('profileImage'),
    moverController.patchMoverProfileController
  );
router
  .route('/me')
  .all(authenticateToken)
  .get(moverController.getMoverController);
router
  .route('/:moverId/detail')
  .all(authenticateToken)
  .get(moverController.getMoverDetailController);
router
  .route('/list')
  .all(authenticateToken)
  .get(moverController.getMoverListController);
router
  .route('/info')
  .all(authenticateToken)
  .patch(moverController.patchMoverInfoController);

export default router;
