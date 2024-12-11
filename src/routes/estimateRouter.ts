import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import estimateController from '../controllers/estimateController';

const estimateRouter = express.Router();

estimateRouter.use(authenticateToken);

estimateRouter.get(
  '/:estimateRequestId',
  estimateController.findReceivedEstimateList
);

export default estimateRouter