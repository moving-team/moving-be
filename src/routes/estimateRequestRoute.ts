import express from 'express';
import { validateEstimateReq } from '../middlewares/validateData';
import estimateRequestController from '../controllers/estimateRequestController';
import { authenticateToken } from '../middlewares/authMiddleware';

const estimateReqRouter = express.Router();

estimateReqRouter
  .route('/')
  .post(
    authenticateToken,
    validateEstimateReq,
    estimateRequestController.createEstimateReq
  )
  .get(authenticateToken, estimateRequestController.findEstimateReq);

estimateReqRouter
  .route('/:estimateRequestId')
  .delete(authenticateToken, estimateRequestController.deleteEstimateReq);

export default estimateReqRouter;
