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

  if (!accessToken && !refreshToken) {
    res.status(401).json({ message: '인증 토큰이 없습니다.' });
    return;
  }

  try {
    const user = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (err) {
    if (!refreshToken) {
      res.clearCookie('accessToken');
      res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
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
      res.status(403).json({ message: '유효하지 않은 리프레시 토큰입니다.' });
      return;
    }
  }
};
