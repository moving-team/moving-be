import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type UserSelectType = Prisma.UserSelect;

type UserPayload<T extends UserSelectType | undefined> = Prisma.UserGetPayload<{
  select: T;
}>;

interface UserPagenationParams extends PagenationParamsByPage {
  where?: Prisma.UserWhereInput;
}

type UserUncheckedCreateInputType = Prisma.UserUncheckedCreateInput;

type UserWhereInputType = Prisma.UserWhereInput;

type UserWhereUniqueInputType = Prisma.UserWhereUniqueInput;

type UserUpdateInputType = Prisma.UserUpdateInput;

type UserOrderByType = Prisma.UserOrderByWithRelationInput;

// createData
function createData<T extends UserSelectType>({
  data,
  select,
  tx,
}: {
  data: UserUncheckedCreateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<UserPayload<T>>;
function createData({
  data,
  tx,
}: {
  data: UserUncheckedCreateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<UserPayload<undefined>>;

async function createData<T extends UserSelectType | undefined>({
  data,
  select,
  tx,
}: {
  data: UserUncheckedCreateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.user.create({ data });
  }
  return await db.user.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends UserSelectType>({
  where,
  select,
  orderBy,
}: {
  where: UserWhereInputType;
  select: T;
  orderBy?: UserOrderByType;
}): Promise<UserPayload<T> | null>;
function findFirstData({
  where,
  orderBy,
}: {
  where: UserWhereInputType;
  orderBy?: UserOrderByType;
}): Promise<UserPayload<undefined> | null>;

async function findFirstData<T extends UserSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: UserWhereInputType;
  select?: T;
  orderBy?: UserOrderByType;
}) {
  if (select === undefined) {
    return await prisma.user.findFirst({ where, orderBy });
  }
  return await prisma.user.findFirst({
    where,
    select,
    orderBy,
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

async function findUniqueOrThrowtData<T extends UserSelectType | undefined>({
  where,
  select,
}: {
  where: UserWhereUniqueInputType;
  select?: T;
}) {
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

async function findManyByPaginationData<T extends UserSelectType | undefined>({
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

//findManyData
function findManyData<T extends UserSelectType>({
  where,
  select,
  orderBy,
}: {
  where: UserWhereInputType;
  select: T;
  orderBy?: UserOrderByType;
}): Promise<UserPayload<T>[]>;
function findManyData({
  where,
  orderBy,
}: {
  where: UserWhereInputType;
  orderBy?: UserOrderByType;
}): Promise<UserPayload<undefined>[]>;

async function findManyData<T extends UserSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: UserWhereInputType;
  select?: T;
  orderBy?: UserOrderByType;
}) {
  if (select === undefined) {
    return await prisma.user.findMany({
      where,
      orderBy,
    });
  }
  return await prisma.user.findMany({
    where,
    select,
    orderBy,
  });
}

// updateData
function updateData<T extends UserSelectType>({
  where,
  data,
  select,
  tx,
}: {
  where: UserWhereUniqueInputType;
  data: UserUpdateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<UserPayload<T>>;
function updateData({
  where,
  data,
  tx,
}: {
  where: UserWhereUniqueInputType;
  data: UserUpdateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<UserPayload<undefined>>;

async function updateData<T extends UserSelectType | undefined>({
  where,
  data,
  select,
  tx,
}: {
  where: UserWhereUniqueInputType;
  data: UserUpdateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.user.update({ where, data });
  }
  return await db.user.update({ where, data, select });
}

// deleteData
async function deleteData(
  where: { id: number },
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx || prisma;
  await db.user.delete({ where });
}

export default {
  createData,
  findFirstData,
  findUniqueOrThrowtData,
  countData,
  findManyByPaginationData,
  updateData,
  deleteData,
  findManyData,
};
