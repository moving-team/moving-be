import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string;
const AWS_REGION = process.env.AWS_REGION as string;
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET as string;

export { PORT, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET };
