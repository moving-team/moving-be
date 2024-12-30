import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import assignedEstimateRequestController from '../controllers/assignedEstimateRequestController';

const assignedEstimateReqRouter = express.Router();

assignedEstimateReqRouter.use(authenticateToken);

assignedEstimateReqRouter
  .post('/', assignedEstimateRequestController.createAssigned)
  .get(
    '/rejectList',
    assignedEstimateRequestController.findRejecteListdAssigned
  )
  .patch(
    '/:estimateRequestId',
    assignedEstimateRequestController.rejectedAssigned
  );

export default assignedEstimateReqRouter;
