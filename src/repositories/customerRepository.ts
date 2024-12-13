import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type CustomerSelectType = Prisma.CustomerSelect;

type CustomerPayload<T extends CustomerSelectType | undefined> =
  Prisma.CustomerGetPayload<{ select: T }>;

interface CustomerPagenationParams extends PagenationParamsByPage {
  where?: Prisma.CustomerWhereInput;
}

type CustomerUncheckedCreateInputType = Prisma.CustomerUncheckedCreateInput;

type CustomerWhereInputType = Prisma.CustomerWhereInput;

type CustomerWhereUniqueInputType = Prisma.CustomerWhereUniqueInput;

type CustomerUpdateInputType = Prisma.CustomerUpdateInput;

type CustomerOrderByType = Prisma.CustomerOrderByWithRelationInput;

// createData
function createData<T extends CustomerSelectType>({
  data,
  select,
}: {
  data: CustomerUncheckedCreateInputType;
  select: T;
}): Promise<CustomerPayload<T>>;
function createData({
  data,
}: {
  data: CustomerUncheckedCreateInputType;
}): Promise<CustomerPayload<undefined>>;

async function createData<T extends CustomerSelectType | undefined>({
  data,
  select,
}: {
  data: CustomerUncheckedCreateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.customer.create({ data });
  }
  return await prisma.customer.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends CustomerSelectType>({
  where,
  select,
  orderBy,
}: {
  where: CustomerWhereInputType;
  select: T;
  orderBy?: CustomerOrderByType;
}): Promise<CustomerPayload<T> | null>;
function findFirstData({
  where,
  orderBy,
}: {
  where: CustomerWhereInputType;
  orderBy?: CustomerOrderByType;
}): Promise<CustomerPayload<undefined> | null>;

async function findFirstData<T extends CustomerSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: CustomerWhereInputType;
  select?: T;
  orderBy?: CustomerOrderByType;
}) {
  if (select === undefined) {
    return await prisma.customer.findFirst({ where, orderBy });
  }
  return await prisma.customer.findFirst({
    where,
    select,
    orderBy,
  });
}

// findUniqueOrThrowtData
function findUniqueOrThrowtData<T extends CustomerSelectType>({
  where,
  select,
}: {
  where: CustomerWhereUniqueInputType;
  select: T;
}): Promise<CustomerPayload<T>>;
function findUniqueOrThrowtData({
  where,
}: {
  where: CustomerWhereUniqueInputType;
}): Promise<CustomerPayload<undefined>>;

async function findUniqueOrThrowtData<
  T extends CustomerSelectType | undefined
>({ where, select }: { where: CustomerWhereUniqueInputType; select?: T }) {
  if (select === undefined) {
    return await prisma.customer.findUniqueOrThrow({ where });
  }
  return await prisma.customer.findUniqueOrThrow({
    where,
    select,
  });
}

// countData
async function countData(where: CustomerWhereInputType): Promise<number> {
  return await prisma.customer.count({ where });
}

// findManyByPaginationData
function findManyByPaginationData<T extends CustomerSelectType>({
  paginationParams,
  select,
}: {
  paginationParams: CustomerPagenationParams;
  select: T;
}): Promise<CustomerPayload<T>[]>;
function findManyByPaginationData({
  paginationParams,
}: {
  paginationParams: CustomerPagenationParams;
}): Promise<CustomerPayload<undefined>[]>;

async function findManyByPaginationData<
  T extends CustomerSelectType | undefined
>({
  paginationParams,
  select,
}: {
  paginationParams: CustomerPagenationParams;
  select?: T;
}) {
  const { orderBy, skip, take, where } = paginationParams;
  if (select === undefined) {
    return await prisma.customer.findMany({
      orderBy,
      skip,
      take,
      where,
    });
  }
  return await prisma.customer.findMany({
    orderBy,
    skip,
    take,
    where,
    select,
  });
}

//findManyData
function findManyData<T extends CustomerSelectType>({
  where,
  select,
  orderBy,
}: {
  where: CustomerWhereInputType;
  select: T;
  orderBy?: CustomerOrderByType;
}): Promise<CustomerPayload<T>[]>;
function findManyData({
  where,
  orderBy,
}: {
  where: CustomerWhereInputType;
  orderBy?: CustomerOrderByType;
}): Promise<CustomerPayload<undefined>[]>;

async function findManyData<T extends CustomerSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: CustomerWhereInputType;
  select?: T;
  orderBy?: CustomerOrderByType;
}) {
  if (select === undefined) {
    return await prisma.customer.findMany({
      where,
      orderBy,
    });
  }
  return await prisma.customer.findMany({
    where,
    select,
    orderBy,
  });
}

// updateData
function updateData<T extends CustomerSelectType>({
  where,
  data,
  select,
}: {
  where: CustomerWhereUniqueInputType;
  data: CustomerUpdateInputType;
  select: T;
}): Promise<CustomerPayload<T>>;
function updateData({
  where,
  data,
}: {
  where: CustomerWhereUniqueInputType;
  data: CustomerUpdateInputType;
}): Promise<CustomerPayload<undefined>>;

async function updateData<T extends CustomerSelectType | undefined>({
  where,
  data,
  select,
}: {
  where: CustomerWhereUniqueInputType;
  data: CustomerUpdateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.customer.update({ where, data });
  }
  return await prisma.customer.update({ where, data, select });
}

// deleteData
async function deleteData(where: { id: number }): Promise<void> {
  await prisma.customer.delete({ where });
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
