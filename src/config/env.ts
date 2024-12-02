import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export { PORT, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET };
