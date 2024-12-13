import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import estimateController from '../controllers/estimateController';

const estimateRouter = express.Router();

estimateRouter.use(authenticateToken);

estimateRouter
  .get('/', estimateController.findWatingEstimateList)
  .get('/confirmed', estimateController.findConfirmedEstimateList)
  .get('/sentList', estimateController.findSentEstimateList)
  .get('/:estimateRequestId', estimateController.findReceivedEstimateList);

export default estimateRouter;
