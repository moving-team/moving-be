import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type CustomerSelectType = Prisma.CustomerSelect;

type CustomerPayload<T extends CustomerSelectType | undefined> =
  Prisma.CustomerGetPayload<{ select: T }>;

interface CustomerPagenationParams extends PagenationParamsByPage {
  where?: Prisma.CustomerWhereInput;
}

type CustomerUncheckedCreateInputTrype = Prisma.CustomerUncheckedCreateInput;

type CustomerWhereInputType = Prisma.CustomerWhereInput;

type CustomerWhereUniqueInputType = Prisma.CustomerWhereUniqueInput;

type CustomerUpdateInputType = Prisma.CustomerUpdateInput;

// createData
function createData<T extends CustomerSelectType>({
  data,
  select,
}: {
  data: CustomerUncheckedCreateInputTrype;
  select: T;
}): Promise<CustomerPayload<T>>;
function createData({
  data,
}: {
  data: CustomerUncheckedCreateInputTrype;
}): Promise<CustomerPayload<undefined>>;

async function createData<T extends CustomerSelectType | undefined>({
  data,
  select,
}: {
  data: CustomerUncheckedCreateInputTrype;
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
}: {
  where: CustomerWhereInputType;
  select: T;
}): Promise<CustomerPayload<T> | null>;
function findFirstData({
  where,
}: {
  where: CustomerWhereInputType;
}): Promise<CustomerPayload<undefined> | null>;

async function findFirstData<T extends CustomerSelectType | undefined>({
  where,
  select,
}: {
  where: CustomerWhereInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.customer.findFirst({ where });
  }
  return await prisma.customer.findFirst({
    where,
    select,
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
};