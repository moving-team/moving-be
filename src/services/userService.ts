import userRepository from '../repositories/userRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET,NODE_ENV} from '../config/env';

const generateToken = (payload: any, secret: string, expiresIn: string) => {
  return jwt.sign(payload, secret, { expiresIn });
};


const getUser = async (id: number) => {
  return await userRepository.findFirstData({ where: { id } });
}

const register = async (data: any, userType: string) => {
  const where = { email: data.email };
  if (!userType || (userType !== 'CUSTOMER' && userType !== 'MOVER')) {
    throw new Error('유저 타입을 확인해주세요.');
  }
  if (!data.email || !data.password) {
    throw new Error('이메일 및 패스워드를 입력해주세요.');
  }
  if (!data.name) {
    throw new Error('이름을 입력해주세요.');
  }
  if (!data.phoneNumber) {
    throw new Error('전화번호를 입력해주세요.');
  }
  if (await userRepository.findFirstData({ where })) {
    const response : any = {
      error : {
        message: '이미 사용중인 이메일 입니다.',
        status: 404,
      },
      user : null
    };
    return response;
  }
  data.password = await bcrypt.hash(data.password, 10);
  data.userType = userType;
  
  const response = {
    error: null,
    user : await userRepository.createData({ data })
  }
  return response;
};

const userLogin = async (data: any) => {
  if (!data.email || !data.password) {
    throw new Error('이메일 및 패스워드를 입력해주세요.');
  }

  const user = await userRepository.findFirstData({
    where: { email: data.email },
  });
  if (!user) {
    const response : any = {
      message: '존재하지 않은 이메일 입니다.',
      type: "email",
    };
    return response;
  } else {
    const isValidPassword = await bcrypt.compare(
      data.password,
      user.password as string
    );
    if (!isValidPassword) {
      const response : any = {
        message: '비밀번호가 올바르지 않습니다.',
        type: "password",
      };
      return response;
    }
    

  const cookieOptions = {
    accessToken: {
      httpOnly: NODE_ENV === 'production' ? true : false,
      secure: true,
      maxAge: 1000 * 60 * 60,
      sameSite: 'none',
    },
    
    refreshToken: {
      httpOnly: NODE_ENV === 'production' ? true : false,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'none',
      },
    };

    const accessToken = generateToken(
      { id: user.id },
      ACCESS_TOKEN_SECRET,
      `${cookieOptions.accessToken.maxAge / 1000}s`
    );
    const refreshToken = generateToken(
      { id: user.id },
      REFRESH_TOKEN_SECRET,
      `${cookieOptions.refreshToken.maxAge / 1000}s`
    );


    return {
      user,
      accessToken,
      refreshToken,
      cookieOptions,
    };
  }
  
};

export { register, userLogin, getUser };
