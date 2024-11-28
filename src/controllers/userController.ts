import * as userService from '../services/userService';
import { Request, Response, NextFunction } from 'express';

const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await userService.register(req.body);
    res.status(201).json('회원가입 성공');
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
    const user = await userService.userLogin(req.body);

    res.cookie("accessToken", user.accessToken, {
      ...user.cookieOptions.accessToken,
      sameSite: "strict",
    });
    res.cookie("refreshToken", user.refreshToken, {
      ...user.cookieOptions.refreshToken,
      sameSite: "strict",
    });

    res.status(201).json("로그인 성공");
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
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .status(200)
    .json('로그아웃 성공');
};

export default { registerController, loginController, logoutController };
