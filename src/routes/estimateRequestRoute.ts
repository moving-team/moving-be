import express from 'express';
import { validateEstimateReq } from '../middlewares/validateData';
import estimateRequestController from '../controllers/estimateRequestController';
import { authenticateToken } from '../middlewares/authMiddleware';

const estimateReqRouter = express.Router();

estimateReqRouter.use(authenticateToken);

estimateReqRouter
  .post('/', validateEstimateReq, estimateRequestController.createEstimateReq)
  .get('/', authenticateToken, estimateRequestController.findEstimateReq)
  .get(
    '/customer/list',
    estimateRequestController.findEstimateReqListByCustomer
  )
  .get('/mover/list', estimateRequestController.findEstimateReqListByMover)
  .delete('/:estimateRequestId', estimateRequestController.deleteEstimateReq);

export default estimateReqRouter;
