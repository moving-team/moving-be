import * as userService from '../services/userService';
import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customerService';
import * as moverService from '../services/moverService';

const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = (req as any).user as { id: number };
  const user = await userService.getUser(id);
  res.status(200).json(user);
}

const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {userType} = req.query
  try {
    const {user,error} = await userService.register(req.body,userType as string);
    
    if(!user && error){
      res.status(404).json(error)
    }else{
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
    
    if(data.accessToken && data.refreshToken){
      res.cookie("accessToken", data.accessToken, {
        ...data.cookieOptions.accessToken,
      });
      res.cookie("refreshToken", data.refreshToken, {
        ...data.cookieOptions.refreshToken,
      });
      res.status(201).json("로그인 성공");
    }else{
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
    .clearCookie('accessToken',{
      httpOnly: NODE_ENV === 'production' ? true : false,
      secure: true,
      maxAge: 1000 * 60 * 60,
      sameSite: "none",
    },)
    .clearCookie('refreshToken',{
      httpOnly: NODE_ENV === 'production' ? true : false,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "none",
    },)
    .status(200)
    .json('로그아웃 성공');
};

export default { registerController, loginController, logoutController, getUserController };
