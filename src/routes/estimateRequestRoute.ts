import express from 'express';
import { validateEstimateReq } from '../middlewares/validateData';
import estimateRequestController from '../controllers/estimateRequestController';

const estimateReqRouter = express.Router();

estimateReqRouter
  .route('/')
  .post(validateEstimateReq, estimateRequestController.createEstimateReq); // 유저 인증 미들웨어 필요

export default estimateReqRouter