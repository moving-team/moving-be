import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errHandler';
import { PORT } from './config/env';
import { estimateReqRouter } from './routes/estimateRequestRoute';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/estimateReq', estimateReqRouter);

app.use(errorHandler);

app.listen(PORT || 3001, () => console.log('Server Started'));
