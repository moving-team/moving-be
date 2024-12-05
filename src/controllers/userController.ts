import * as userService from '../services/userService';
import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customerService';
import * as moverService from '../services/moverService';

const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {userType} = req.query
  try {
    const user = await userService.register(req.body,userType as string);
    
    if (user.userType === 'CUSTOMER') {
      await customerService.createCustomer(user.id);
    } else if (user.userType === 'MOVER') {
      await moverService.createMover(user.id);
    } else {
      res.status(400).json('회원가입 실패');
    }
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
