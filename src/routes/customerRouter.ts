import express from 'express';
import * as customerController from '../controllers/customerController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { uploadImage } from '../middlewares/uploadMiddleware';

const router = express.Router();

router
    .route('/profile')
    .all(authenticateToken)
    .patch(
        uploadImage('profileImage'), 
        customerController.patchCustomerProfileController
    );
router
    .route('/info')
    .all(authenticateToken)
    .patch(customerController.patchCustomerInfoController);
export default router;
