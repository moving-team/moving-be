import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errHandler';
import { PORT } from './config/env';
import userRouter from './routes/userRouter';
import customerRouter from './routes/customerRouter';
import cookieParser from 'cookie-parser';
const app = express();
app.use(cookieParser());

app.use(cors());
app.use(express.json());
app.use('/user', userRouter);
app.use('/customer', customerRouter);

app.use(errorHandler);

app.listen(PORT || 3001, () => console.log('Server Started'));
