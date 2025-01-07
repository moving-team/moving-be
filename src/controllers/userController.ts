import * as userService from '../services/userService';
import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customerService';
import * as moverService from '../services/moverService';
import { NODE_ENV } from '../config/env';
import { kakao } from '../utils/kakao';
import { naver } from '../utils/naver';
import { google } from '../utils/google';

const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = (req as any).user as { id: number };
    if (!id) {
      res.status(200).json(null);
      return;
    }
    const userData = await userService.getUser(id);
    res.status(200).json(userData);
  } catch (err) {
    next(err);
  }
};

const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userType } = req.query;
  try {
    const { user, error } = await userService.register(
      req.body,
      userType as string
    );

    if (!user && error) {
      res.status(404).json(error);
    } else {
      if (user.userType === 'CUSTOMER') {
        await customerService.createCustomer(user.id);
      } else if (user.userType === 'MOVER') {
        await moverService.createMover(user.id);
      } else {
        res.status(400).json('회원가입 실패');
      }
      res.status(201).json('회원가입 성공');
    }
  } catch (err) {
    next(err);
  }
};

const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await userService.userLogin(req.body);

    if (data.accessToken && data.refreshToken) {
      res.cookie('accessToken', data.accessToken, {
        ...data.cookieOptions.accessToken,
      });
      res.cookie('refreshToken', data.refreshToken, {
        ...data.cookieOptions.refreshToken,
      });
      res.status(201).json('로그인 성공');
    } else {
      res.status(404).json(data);
    }
  } catch (err) {
    next(err);
  }
};

const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res
    .clearCookie('accessToken', {
      httpOnly: NODE_ENV === 'production' ? true : false,
      secure: true,
      expires: new Date(0),
      maxAge: 0,
      sameSite: 'none',
    })
    .clearCookie('refreshToken', {
      httpOnly: NODE_ENV === 'production' ? true : false,
      secure: true,
      expires: new Date(0),
      maxAge: 0,
      sameSite: 'none',
    })
    .status(200)
    .json('로그아웃 성공');
};

const naverLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userType } = req.query;
  if (!userType) {
    res.status(400).json('userType이 필요합니다.');
  } else {
    const url = naver.getNaverLoginUrl(userType as string, {
      state: userType as string,
    });
    res.redirect(url);
    // res.status(200).json(url);
  }
};

const naverCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { code, state } = req.query;
  if (!state) {
    res.status(400).json('userType이 필요합니다.');
  } else {
    const [userType, randomState] = (state as string).split('_');
    try {
      const tokenData = await naver.getToken(code as string);
      const userData = await naver.getUserInfo(tokenData.access_token);
      const userCheck = await userService.checkUser(userData.response.email);

      if (userCheck) {
        const data = await userService.SNSLogin(userCheck);
        if (data.accessToken && data.refreshToken) {
          res.cookie('accessToken', data.accessToken, {
            ...data.cookieOptions.accessToken,
            sameSite: 'none',
          });
          res.cookie('refreshToken', data.refreshToken, {
            ...data.cookieOptions.refreshToken,
            sameSite: 'none',
          });
          res.redirect('http://localhost:3000/');
        }
      } else {
        const user = await userService.SNSRegister(
          userData.response,
          userType as string
        );
        if (userType === 'CUSTOMER') {
          await customerService.createCustomer(user.id);
        } else if (userType === 'MOVER') {
          await moverService.createMover(user.id);
        }
        const data = await userService.SNSLogin(user);
        if (data.accessToken && data.refreshToken) {
          res.cookie('accessToken', data.accessToken, {
            ...data.cookieOptions.accessToken,
            sameSite: 'none',
          });
          res.cookie('refreshToken', data.refreshToken, {
            ...data.cookieOptions.refreshToken,
            sameSite: 'none',
          });
          res.redirect('http://localhost:3000/');
        }
      }
    } catch (err) {
      next(err);
    }
  }
};

const kakaoLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userType } = req.query;
  if (!userType) {
    res.status(400).json('userType이 필요합니다.');
  } else {
    const url = kakao.getKakaoLoginUrl(userType as string, {
      state: userType as string,
    });
    res.redirect(url);
  }
};

const kakaoCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, state } = req.query; // state : userType
    const tokenData = await kakao.getToken(code as string);
    const userData = await kakao.getUserInfo(tokenData.access_token); // userData = {nickname, providerId}
    const userCheck = await userService.checkUser(userData.nickname);

    if (userCheck) {
      const data = await userService.SNSLogin(userCheck);
      if (data.accessToken && data.refreshToken) {
        res.cookie('accessToken', data.accessToken, {
          ...data.cookieOptions.accessToken,
          sameSite: 'none',
        });
        res.cookie('refreshToken', data.refreshToken, {
          ...data.cookieOptions.refreshToken,
          sameSite: 'none',
        });
        res.redirect('http://localhost:3000/');
      } else {
        res.status(404).json(data);
      }
    } else {
      const user = await userService.SNSRegister(userData, state as string);
      if (state === 'CUSTOMER') {
        await customerService.createCustomer(user.id);
      } else if (state === 'MOVER') {
        await moverService.createMover(user.id);
      }
      const data = await userService.SNSLogin(user);
      if (data.accessToken && data.refreshToken) {
        res.cookie('accessToken', data.accessToken, {
          ...data.cookieOptions.accessToken,
          sameSite: 'none',
        });
        res.cookie('refreshToken', data.refreshToken, {
          ...data.cookieOptions.refreshToken,
          sameSite: 'none',
        });
        res.redirect('http://localhost:3000/');
      }
    }
  } catch (err) {
    next(err);
  }
};

export const googleLoginController = (req: Request, res: Response) => {
  const { userType } = req.query;
  if (!userType) {
    res.status(400).json('userType이 필요합니다.');
  } else {
    const url = google.getGoogleLoginUrl(userType as string);
    res.redirect(url);
  }
};

export const googleCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { code, state } = req.query;

  if (!state) {
    res.status(400).json('userType이 필요합니다.');
  } else {
    const [userType, randomState] = (state as string).split('_');
    try {
      const tokenData = await google.getToken(code as string);
      const userData = await google.getUserInfo(tokenData.access_token);
      const userCheck = await userService.checkUser(userData.response.email);

      if (userCheck) {
        const data = await userService.SNSLogin(userCheck);
        if (data.accessToken && data.refreshToken) {
          res.cookie('accessToken', data.accessToken, {
            ...data.cookieOptions.accessToken,
            sameSite: 'none',
          });
          res.cookie('refreshToken', data.refreshToken, {
            ...data.cookieOptions.refreshToken,
            sameSite: 'none',
          });
          res.redirect('http://localhost:3000/');
        } else {
          res.status(404).json(data);
        }
      } else {
        const user = await userService.SNSRegister(
          userData,
          userType as string
        );
        if (state === 'CUSTOMER') {
          await customerService.createCustomer(user.id);
        } else if (state === 'MOVER') {
          await moverService.createMover(user.id);
        }
        const data = await userService.SNSLogin(user);
        if (data.accessToken && data.refreshToken) {
          res.cookie('accessToken', data.accessToken, {
            ...data.cookieOptions.accessToken,
            sameSite: 'none',
          });
          res.cookie('refreshToken', data.refreshToken, {
            ...data.cookieOptions.refreshToken,
            sameSite: 'none',
          });
          res.redirect('http://localhost:3000/');
        }
      }
    } catch (err) {
      next(err);
    }
  }
};

export default {
  registerController,
  loginController,
  logoutController,
  getUserController,
  kakaoLoginController,
  kakaoCallbackController,
  naverLoginController,
  naverCallbackController,
  googleLoginController,
  googleCallbackController,
};
