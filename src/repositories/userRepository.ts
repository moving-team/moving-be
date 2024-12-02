import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type UserSelectType = Prisma.UserSelect;

type UserPayload<T extends UserSelectType | undefined> =
  Prisma.UserGetPayload<{ select: T }>;

interface UserPagenationParams extends PagenationParamsByPage {
  where?: Prisma.UserWhereInput;
}

type UserUncheckedCreateInputType =
  Prisma.UserUncheckedCreateInput;

type UserWhereInputType = Prisma.UserWhereInput;

type UserWhereUniqueInputType = Prisma.UserWhereUniqueInput;

type UserUpdateInputType = Prisma.UserUpdateInput;

// createData
function createData<T extends UserSelectType>({
  data,
  select,
}: {
  data: UserUncheckedCreateInputType;
  select: T;
}): Promise<UserPayload<T>>;
function createData({
  data,
}: {
  data: UserUncheckedCreateInputType;
}): Promise<UserPayload<undefined>>;

async function createData<T extends UserSelectType | undefined>({
  data,
  select,
}: {
  data: UserUncheckedCreateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.user.create({ data });
  }
  return await prisma.user.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends UserSelectType>({
  where,
  select,
}: {
  where: UserWhereInputType;
  select: T;
}): Promise<UserPayload<T> | null>;
function findFirstData({
  where,
}: {
  where: UserWhereInputType;
}): Promise<UserPayload<undefined> | null>;

async function findFirstData<T extends UserSelectType | undefined>({
  where,
  select,
}: {
  where: UserWhereInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.user.findFirst({ where });
  }
  return await prisma.user.findFirst({
    where,
    select,
  });
}

// findUniqueOrThrowtData
function findUniqueOrThrowtData<T extends UserSelectType>({
  where,
  select,
}: {
  where: UserWhereUniqueInputType;
  select: T;
}): Promise<UserPayload<T>>;
function findUniqueOrThrowtData({
  where,
}: {
  where: UserWhereUniqueInputType;
}): Promise<UserPayload<undefined>>;

async function findUniqueOrThrowtData<
  T extends UserSelectType | undefined
>({ where, select }: { where: UserWhereUniqueInputType; select?: T }) {
  if (select === undefined) {
    return await prisma.user.findUniqueOrThrow({ where });
  }
  return await prisma.user.findUniqueOrThrow({
    where,
    select,
  });
}

// countData
async function countData(where: UserWhereInputType): Promise<number> {
  return await prisma.user.count({ where });
}

// findManyByPaginationData
function findManyByPaginationData<T extends UserSelectType>({
  paginationParams,
  select,
}: {
  paginationParams: UserPagenationParams;
  select: T;
}): Promise<UserPayload<T>[]>;
function findManyByPaginationData({
  paginationParams,
}: {
  paginationParams: UserPagenationParams;
}): Promise<UserPayload<undefined>[]>;

async function findManyByPaginationData<
  T extends UserSelectType | undefined
>({
  paginationParams,
  select,
}: {
  paginationParams: UserPagenationParams;
  select?: T;
}) {
  const { orderBy, skip, take, where } = paginationParams;
  if (select === undefined) {
    return await prisma.user.findMany({
      orderBy,
      skip,
      take,
      where,
    });
  }
  return await prisma.user.findMany({
    orderBy,
    skip,
    take,
    where,
    select,
  });
}

// updateData
function updateData<T extends UserSelectType>({
  where,
  data,
  select,
}: {
  where: UserWhereUniqueInputType;
  data: UserUpdateInputType;
  select: T;
}): Promise<UserPayload<T>>;
function updateData({
  where,
  data,
}: {
  where: UserWhereUniqueInputType;
  data: UserUpdateInputType;
}): Promise<UserPayload<undefined>>;

async function updateData<T extends UserSelectType | undefined>({
  where,
  data,
  select,
}: {
  where: UserWhereUniqueInputType;
  data: UserUpdateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.user.update({ where, data });
  }
  return await prisma.user.update({ where, data, select });
}

// deleteData
async function deleteData(where: { id: number }): Promise<void> {
  await prisma.user.delete({ where });
}

export default {
  createData,
  findFirstData,
  findUniqueOrThrowtData,
  countData,
  findManyByPaginationData,
  updateData,
  deleteData,
};
