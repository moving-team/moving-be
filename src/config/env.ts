import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string;
const AWS_REGION = process.env.AWS_REGION as string;
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET as string;
const USER_URL = process.env.USER_URL as string;
const USER_URL2 = process.env.USER_URL2 as string;
const SC_URL = process.env.SC_URL as string;
const NODE_ENV = process.env.NODE_ENV as string;
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY as string;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI as string;
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID as string;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET as string;
const NAVER_REDIRECT_URI = process.env.NAVER_REDIRECT_URI as string;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;

export {
  PORT,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET,
  USER_URL,
  USER_URL2,
  SC_URL,
  NODE_ENV,
  KAKAO_REST_API_KEY,
  KAKAO_REDIRECT_URI,
  NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET,
  NAVER_REDIRECT_URI,
};
