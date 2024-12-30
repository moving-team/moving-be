import bcrypt from 'bcrypt';
import userRepository from '../repositories/userRepository';
import customerRepository from '../repositories/customerRepository';
import estimateRequestRepository from '../repositories/estimateRequestRepository';
import { $Enums } from '@prisma/client';

const getCustomer = async (userId: number) => {
  const customerData = await customerRepository.findFirstData({
    where: { userId: userId },
    select: {
      id: true,
      userId: true,
      profileImage: true,
      serviceType: true,
      region: true,
      User: {
        select: {
          name: true,
        },
      },
    },
  });

  const estimateReqConfirmed = await estimateRequestRepository.findFirstData({
    where: {
      AND: [{ customerId: customerData?.userId }, { isConfirmed: false }],
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  const isConfirmed = estimateReqConfirmed === null;
  console.log(estimateReqConfirmed);

  const list = {
    id: customerData?.id,
    userId: customerData?.userId,
    profileImg: customerData?.profileImage,
    serviceType: customerData?.serviceType,
    region: customerData?.region,
    customername: customerData?.User?.name,
    isConfirmed,
  };

  return list;
};

// 301  1
const createCustomer = async (userId: number) => {
  const data = {
    userId: userId,
    region: 'NULL' as $Enums.serviceRegion,
    serviceType: [],
  };

  const customerData = await customerRepository.createData({ data });

  return customerData;
};

const patchCustomerProfile = async (userId: number, data: any) => {
  const customerData = await customerRepository.findFirstData({
    where: { userId: userId },
  }); //
  if (!customerData) {
    throw new Error('프로필 생성하지 않음');
  }

  const patchData = {
    profileImage: data.profileImage,
    serviceType: data.serviceType,
    region: data.region,
  };
  const where = { id: customerData.id };
  return await customerRepository.updateData({ where, data: patchData });
};

const patchCustomerInfo = async (userId: number, data: any) => {
  const userData = await userRepository.findFirstData({
    where: { id: userId },
  });
  if (!userData) {
    throw new Error('유저 정보 없음');
  }
  const isPasswordMatch = await bcrypt.compare(
    data.usedPassword,
    userData.password as string
  );
  if (!isPasswordMatch) {
    throw new Error('비밀번호가 일치하지 않아요');
  }
  const newHashedPassword = await bcrypt.hash(data.newPassword, 10);
  const patchData = {
    name: data.name,
    phoneNumber: data.phoneNumber,
    password: newHashedPassword,
  };
  const where = { id: userData.id };
  return await userRepository.updateData({ where, data: patchData });
};

export { patchCustomerProfile, patchCustomerInfo, createCustomer, getCustomer };
