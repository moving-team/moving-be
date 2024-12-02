import express from 'express';
import * as moverController from '../controllers/moverController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { uploadImage } from '../middlewares/uploadMiddleware';

const router = express.Router();

router
    .route('/profile')
    .all(authenticateToken)
    .patch(uploadImage('profileImage'), moverController.patchMoverProfileController);
router
    .route('/me')
    .all(authenticateToken)
    .get(moverController.getMoverController);
router
    .route('/:moverId/detail')
    .all(authenticateToken)
    .get(moverController.getMoverDetailController);
export default router;
