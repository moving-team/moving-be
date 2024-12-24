import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import estimateController from '../controllers/estimateController';
import { validateEstimate } from '../middlewares/validateData';

const estimateRouter = express.Router();

estimateRouter.use(authenticateToken);

estimateRouter
  .post('/', validateEstimate, estimateController.createEstimate)
  .get('/', estimateController.findWatingEstimateList)
  .get('/confirmed', estimateController.findConfirmedEstimateList)
  .get('/sentList', estimateController.findSentEstimateList)
  .get('/movedList', estimateController.findMovingCompleteList)
  .get('/list/:estimateRequestId', estimateController.findReceivedEstimateList)
  .patch('/:estimateId', estimateController.updateConfirmEstimate)
  .post('/update-database', estimateController.updateDatabase)
  .get('/:estimateId', estimateController.findEstimateDetail);

export default estimateRouter;
