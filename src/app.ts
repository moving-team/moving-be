import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use(errorHandler);

app.listen(process.env.PORT || 3001, () => console.log('Server Started'));
