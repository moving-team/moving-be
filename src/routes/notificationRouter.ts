import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import notificationCotroller from '../controllers/notificationCotroller';

const notificationRouter = express.Router();

notificationRouter.post('/', notificationCotroller.sendMovingDayReminder);

export default notificationRouter;
