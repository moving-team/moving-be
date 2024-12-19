import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config/env';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  console.log('Cookies:', req.cookies); // 전체 쿠키 확인
  console.log('Access Token:', accessToken); // access token 값 확인
  console.log('Refresh Token:', refreshToken); // refresh token 값 확인

  if (!accessToken && !refreshToken) {
    req.user = {};
    console.log('빈값');
    next();
    return;
  }

  try {
    const user = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (err) {
    if (!refreshToken) {
      res.clearCookie('accessToken');
      req.user = {};
      next();
      return;
    }

    try {
      const user = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload;
      const newAccessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60,
        sameSite: 'none',
      });

      req.user = user;
      next();
    } catch (refreshErr) {
      req.user = {};
      next();
      return;
    }
  }
};
