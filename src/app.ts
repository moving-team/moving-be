import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());

app.listen(process.env.PORT || 3001, () => console.log('Server Started'));
