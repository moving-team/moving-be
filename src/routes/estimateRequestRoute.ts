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
  );

export default estimateReqRouter;
