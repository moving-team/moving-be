import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errHandler';
import { PORT } from './config/env';
import estimateReqRouter from './routes/estimateRequestRoute';
import userRouter from './routes/userRouter';
import customerRouter from './routes/customerRouter';
import cookieParser from 'cookie-parser';
import moverRouter from './routes/moverRouter';
import { USER_URL, USER_URL2, SC_URL } from './config/env';
import morgan from 'morgan';
const app = express();
app.use(cookieParser());
app.use(morgan('dev'));

app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
      credentials: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })
  );
app.use(express.json());
app.use('/user', userRouter);
app.use('/customer', customerRouter);
app.use('/mover', moverRouter);
app.use('/estimateReq', estimateReqRouter);

app.use(errorHandler);

app.listen(PORT || 3001, () => console.log('Server Started'));





