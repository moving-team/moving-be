import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config/env';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string;
}

const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ message: '인증 토큰이 없습니다.' });
  }

  try {
    const user = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (err) {
    if (!refreshToken) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }

    try {
      const user = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload;
      const newAccessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60,
        sameSite: 'strict',
      });

      req.user = user;
      next();
    } catch (refreshErr) {
      return res.status(403).json({ message: '유효하지 않은 리프레시 토큰입니다.' });
    }
  }
};

export default authenticateToken;
