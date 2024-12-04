import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type EstimateSelectType = Prisma.EstimateSelect;

type EstimatePayload<T extends EstimateSelectType | undefined> =
  Prisma.EstimateGetPayload<{ select: T }>;

interface EstimatePagenationParams extends PagenationParamsByPage {
  where?: Prisma.EstimateWhereInput;
}

type EstimateUncheckedCreateInputType = Prisma.EstimateUncheckedCreateInput;

type EstimateWhereInputType = Prisma.EstimateWhereInput;

type EstimateWhereUniqueInputType = Prisma.EstimateWhereUniqueInput;

type EstimateUpdateInputType = Prisma.EstimateUpdateInput;

type EstimateOrderByType = Prisma.EstimateOrderByWithRelationInput;

// createData
function createData<T extends EstimateSelectType>({
  data,
  select,
}: {
  data: EstimateUncheckedCreateInputType;
  select: T;
}): Promise<EstimatePayload<T>>;
function createData({
  data,
}: {
  data: EstimateUncheckedCreateInputType;
}): Promise<EstimatePayload<undefined>>;

async function createData<T extends EstimateSelectType | undefined>({
  data,
  select,
}: {
  data: EstimateUncheckedCreateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.estimate.create({ data });
  }
  return await prisma.estimate.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends EstimateSelectType>({
  where,
  select,
  orderBy,
}: {
  where: EstimateWhereInputType;
  select: T;
  orderBy?: EstimateOrderByType;
}): Promise<EstimatePayload<T> | null>;
function findFirstData({
  where,
  orderBy,
}: {
  where: EstimateWhereInputType;
  orderBy?: EstimateOrderByType;
}): Promise<EstimatePayload<undefined> | null>;

async function findFirstData<T extends EstimateSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: EstimateWhereInputType;
  select?: T;
  orderBy?: EstimateOrderByType;
}) {
  if (select === undefined) {
    return await prisma.estimate.findFirst({ where, orderBy });
  }
  return await prisma.estimate.findFirst({
    where,
    select,
    orderBy,
  });
}

// findUniqueOrThrowtData
function findUniqueOrThrowtData<T extends EstimateSelectType>({
  where,
  select,
}: {
  where: EstimateWhereUniqueInputType;
  select: T;
}): Promise<EstimatePayload<T>>;
function findUniqueOrThrowtData({
  where,
}: {
  where: EstimateWhereUniqueInputType;
}): Promise<EstimatePayload<undefined>>;

async function findUniqueOrThrowtData<
  T extends EstimateSelectType | undefined
>({ where, select }: { where: EstimateWhereUniqueInputType; select?: T }) {
  if (select === undefined) {
    return await prisma.estimate.findUniqueOrThrow({ where });
  }
  return await prisma.estimate.findUniqueOrThrow({
    where,
    select,
  });
}

// countData
async function countData(where: EstimateWhereInputType): Promise<number> {
  return await prisma.estimate.count({ where });
}

// findManyByPaginationData
function findManyByPaginationData<T extends EstimateSelectType>({
  paginationParams,
  select,
}: {
  paginationParams: EstimatePagenationParams;
  select: T;
}): Promise<EstimatePayload<T>[]>;
function findManyByPaginationData({
  paginationParams,
}: {
  paginationParams: EstimatePagenationParams;
}): Promise<EstimatePayload<undefined>[]>;

async function findManyByPaginationData<
  T extends EstimateSelectType | undefined
>({
  paginationParams,
  select,
}: {
  paginationParams: EstimatePagenationParams;
  select?: T;
}) {
  const { orderBy, skip, take, where } = paginationParams;
  if (select === undefined) {
    return await prisma.estimate.findMany({
      orderBy,
      skip,
      take,
      where,
    });
  }
  return await prisma.estimate.findMany({
    orderBy,
    skip,
    take,
    where,
    select,
  });
}

// updateData
function updateData<T extends EstimateSelectType>({
  where,
  data,
  select,
}: {
  where: EstimateWhereUniqueInputType;
  data: EstimateUpdateInputType;
  select: T;
}): Promise<EstimatePayload<T>>;
function updateData({
  where,
  data,
}: {
  where: EstimateWhereUniqueInputType;
  data: EstimateUpdateInputType;
}): Promise<EstimatePayload<undefined>>;

async function updateData<T extends EstimateSelectType | undefined>({
  where,
  data,
  select,
}: {
  where: EstimateWhereUniqueInputType;
  data: EstimateUpdateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.estimate.update({ where, data });
  }
  return await prisma.estimate.update({ where, data, select });
}

// deleteData
async function deleteData(where: { id: number }): Promise<void> {
  await prisma.estimate.delete({ where });
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
