import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type AssignedEstimateReqSelectType = Prisma.AssignedEstimateRequestSelect;

type AssignedEstimateReqPayload<
  T extends AssignedEstimateReqSelectType | undefined
> = Prisma.AssignedEstimateRequestGetPayload<{ select: T }>;

interface AssignedEstimateReqPagenationParams extends PagenationParamsByPage {
  where?: Prisma.AssignedEstimateRequestWhereInput;
}

type AssignedEstimateReqUncheckedCreateInputType =
  Prisma.AssignedEstimateRequestUncheckedCreateInput;

type AssignedEstimateReqWhereInputType =
  Prisma.AssignedEstimateRequestWhereInput;

type AssignedEstimateReqWhereUniqueInputType =
  Prisma.AssignedEstimateRequestWhereUniqueInput;

type AssignedEstimateReqUpdateInputType =
  Prisma.AssignedEstimateRequestUpdateInput;

type AssignedEstimateReqOrderByType =
  Prisma.AssignedEstimateRequestOrderByWithRelationInput;

// createData
function createData<T extends AssignedEstimateReqSelectType>({
  data,
  select,
}: {
  data: AssignedEstimateReqUncheckedCreateInputType;
  select: T;
}): Promise<AssignedEstimateReqPayload<T>>;
function createData({
  data,
}: {
  data: AssignedEstimateReqUncheckedCreateInputType;
}): Promise<AssignedEstimateReqPayload<undefined>>;

async function createData<T extends AssignedEstimateReqSelectType | undefined>({
  data,
  select,
}: {
  data: AssignedEstimateReqUncheckedCreateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.assignedEstimateRequest.create({ data });
  }
  return await prisma.assignedEstimateRequest.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends AssignedEstimateReqSelectType>({
  where,
  select,
  orderBy,
}: {
  where: AssignedEstimateReqWhereInputType;
  select: T;
  orderBy?: AssignedEstimateReqOrderByType;
}): Promise<AssignedEstimateReqPayload<T> | null>;
function findFirstData({
  where,
  orderBy,
}: {
  where: AssignedEstimateReqWhereInputType;
  orderBy?: AssignedEstimateReqOrderByType;
}): Promise<AssignedEstimateReqPayload<undefined> | null>;

async function findFirstData<
  T extends AssignedEstimateReqSelectType | undefined
>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: AssignedEstimateReqWhereInputType;
  select?: T;
  orderBy?: AssignedEstimateReqOrderByType;
}) {
  if (select === undefined) {
    return await prisma.assignedEstimateRequest.findFirst({ where, orderBy });
  }
  return await prisma.assignedEstimateRequest.findFirst({
    where,
    select,
    orderBy,
  });
}

// findUniqueOrThrowtData
function findUniqueOrThrowtData<T extends AssignedEstimateReqSelectType>({
  where,
  select,
}: {
  where: AssignedEstimateReqWhereUniqueInputType;
  select: T;
}): Promise<AssignedEstimateReqPayload<T>>;
function findUniqueOrThrowtData({
  where,
}: {
  where: AssignedEstimateReqWhereUniqueInputType;
}): Promise<AssignedEstimateReqPayload<undefined>>;

async function findUniqueOrThrowtData<
  T extends AssignedEstimateReqSelectType | undefined
>({
  where,
  select,
}: {
  where: AssignedEstimateReqWhereUniqueInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.assignedEstimateRequest.findUniqueOrThrow({ where });
  }
  return await prisma.assignedEstimateRequest.findUniqueOrThrow({
    where,
    select,
  });
}

// countData
async function countData(
  where: AssignedEstimateReqWhereInputType
): Promise<number> {
  return await prisma.assignedEstimateRequest.count({ where });
}

// findManyByPaginationData
function findManyByPaginationData<T extends AssignedEstimateReqSelectType>({
  paginationParams,
  select,
}: {
  paginationParams: AssignedEstimateReqPagenationParams;
  select: T;
}): Promise<AssignedEstimateReqPayload<T>[]>;
function findManyByPaginationData({
  paginationParams,
}: {
  paginationParams: AssignedEstimateReqPagenationParams;
}): Promise<AssignedEstimateReqPayload<undefined>[]>;

async function findManyByPaginationData<
  T extends AssignedEstimateReqSelectType | undefined
>({
  paginationParams,
  select,
}: {
  paginationParams: AssignedEstimateReqPagenationParams;
  select?: T;
}) {
  const { orderBy, skip, take, where } = paginationParams;
  if (select === undefined) {
    return await prisma.assignedEstimateRequest.findMany({
      orderBy,
      skip,
      take,
      where,
    });
  }
  return await prisma.assignedEstimateRequest.findMany({
    orderBy,
    skip,
    take,
    where,
    select,
  });
}

//findManyData
function findManyData<T extends AssignedEstimateReqSelectType>({
  where,
  select,
  orderBy,
}: {
  where: AssignedEstimateReqWhereInputType;
  select: T;
  orderBy?: AssignedEstimateReqOrderByType;
}): Promise<AssignedEstimateReqPayload<T>[]>;
function findManyData({
  where,
  orderBy,
}: {
  where: AssignedEstimateReqWhereInputType;
  orderBy?: AssignedEstimateReqOrderByType;
}): Promise<AssignedEstimateReqPayload<undefined>[]>;

async function findManyData<T extends AssignedEstimateReqSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: AssignedEstimateReqWhereInputType;
  select?: T;
  orderBy?: AssignedEstimateReqOrderByType;
}) {
  if (select === undefined) {
    return await prisma.assignedEstimateRequest.findMany({
      where,
      orderBy,
    });
  }
  return await prisma.assignedEstimateRequest.findMany({
    where,
    select,
    orderBy,
  });
}

// updateData
function updateData<T extends AssignedEstimateReqSelectType>({
  where,
  data,
  select,
}: {
  where: AssignedEstimateReqWhereUniqueInputType;
  data: AssignedEstimateReqUpdateInputType;
  select: T;
}): Promise<AssignedEstimateReqPayload<T>>;
function updateData({
  where,
  data,
}: {
  where: AssignedEstimateReqWhereUniqueInputType;
  data: AssignedEstimateReqUpdateInputType;
}): Promise<AssignedEstimateReqPayload<undefined>>;

async function updateData<T extends AssignedEstimateReqSelectType | undefined>({
  where,
  data,
  select,
}: {
  where: AssignedEstimateReqWhereUniqueInputType;
  data: AssignedEstimateReqUpdateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.assignedEstimateRequest.update({ where, data });
  }
  return await prisma.assignedEstimateRequest.update({ where, data, select });
}

// deleteData
async function deleteData(where: { id: number }): Promise<void> {
  await prisma.assignedEstimateRequest.delete({ where });
}

export default {
  createData,
  findFirstData,
  findUniqueOrThrowtData,
  countData,
  findManyByPaginationData,
  updateData,
  deleteData,
  findManyData
};
