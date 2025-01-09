import prisma from '../config/prisma';
import { EstimatePagenationParamsByPage,} from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type EstimateReqSelectType = Prisma.EstimateRequestSelect;

type EstimateReqPayload<T extends EstimateReqSelectType | undefined> =
  Prisma.EstimateRequestGetPayload<{ select: T }>;

interface EstimateReqPagenationParams extends EstimatePagenationParamsByPage {
  where?: Prisma.EstimateRequestWhereInput;
}

type EstimateReqUncheckedCreateInputType =
  Prisma.EstimateRequestUncheckedCreateInput;

type EstimateReqWhereInputType = Prisma.EstimateRequestWhereInput;

type EstimateReqWhereUniqueInputType = Prisma.EstimateRequestWhereUniqueInput;

type EstimateReqUpdateInputType = Prisma.EstimateRequestUpdateInput;

type EstimateReqOrderByType = Prisma.EstimateRequestOrderByWithRelationInput;

// createData
function createData<T extends EstimateReqSelectType>({
  data,
  select,
  tx,
}: {
  data: EstimateReqUncheckedCreateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<EstimateReqPayload<T>>;
function createData({
  data,
  tx,
}: {
  data: EstimateReqUncheckedCreateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<EstimateReqPayload<undefined>>;

async function createData<T extends EstimateReqSelectType | undefined>({
  data,
  select,
  tx,
}: {
  data: EstimateReqUncheckedCreateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.estimateRequest.create({ data });
  }
  return await db.estimateRequest.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends EstimateReqSelectType>({
  where,
  select,
  orderBy,
}: {
  where: EstimateReqWhereInputType;
  select: T;
  orderBy?: EstimateReqOrderByType;
}): Promise<EstimateReqPayload<T> | null>;
function findFirstData({
  where,
  orderBy,
}: {
  where: EstimateReqWhereInputType;
  orderBy?: EstimateReqOrderByType;
}): Promise<EstimateReqPayload<undefined> | null>;

async function findFirstData<T extends EstimateReqSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: EstimateReqWhereInputType;
  select?: T;
  orderBy?: EstimateReqOrderByType;
}) {
  if (select === undefined) {
    return await prisma.estimateRequest.findFirst({ where, orderBy });
  }
  return await prisma.estimateRequest.findFirst({
    where,
    select,
    orderBy,
  });
}

// findUniqueOrThrowtData
function findUniqueOrThrowtData<T extends EstimateReqSelectType>({
  where,
  select,
}: {
  where: EstimateReqWhereUniqueInputType;
  select: T;
}): Promise<EstimateReqPayload<T>>;
function findUniqueOrThrowtData({
  where,
}: {
  where: EstimateReqWhereUniqueInputType;
}): Promise<EstimateReqPayload<undefined>>;

async function findUniqueOrThrowtData<
  T extends EstimateReqSelectType | undefined
>({ where, select }: { where: EstimateReqWhereUniqueInputType; select?: T }) {
  if (select === undefined) {
    return await prisma.estimateRequest.findUniqueOrThrow({ where });
  }
  return await prisma.estimateRequest.findUniqueOrThrow({
    where,
    select,
  });
}

// countData
async function countData(where: EstimateReqWhereInputType): Promise<number> {
  return await prisma.estimateRequest.count({ where });
}

// findManyByPaginationData
function findManyByPaginationData<T extends EstimateReqSelectType>({
  paginationParams,
  select,
}: {
  paginationParams: EstimateReqPagenationParams;
  select: T;
}): Promise<EstimateReqPayload<T>[]>;
function findManyByPaginationData({
  paginationParams,
}: {
  paginationParams: EstimateReqPagenationParams;
}): Promise<EstimateReqPayload<undefined>[]>;

async function findManyByPaginationData<
  T extends EstimateReqSelectType | undefined
>({
  paginationParams,
  select,
}: {
  paginationParams: EstimateReqPagenationParams;
  select?: T;
}) {
  const { orderBy, skip, take, where } = paginationParams;
  if (select === undefined) {
    return await prisma.estimateRequest.findMany({
      orderBy,
      skip,
      take,
      where,
    });
  }
  return await prisma.estimateRequest.findMany({
    orderBy,
    skip,
    take,
    where,
    select,
  });
}

//findManyData
function findManyData<T extends EstimateReqSelectType>({
  where,
  select,
  orderBy,
}: {
  where: EstimateReqWhereInputType;
  select: T;
  orderBy?: EstimateReqOrderByType;
}): Promise<EstimateReqPayload<T>[]>;
function findManyData({
  where,
  orderBy,
}: {
  where: EstimateReqWhereInputType;
  orderBy?: EstimateReqOrderByType;
}): Promise<EstimateReqPayload<undefined>[]>;

async function findManyData<T extends EstimateReqSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: EstimateReqWhereInputType;
  select?: T;
  orderBy?: EstimateReqOrderByType;
}) {
  if (select === undefined) {
    return await prisma.estimateRequest.findMany({
      where,
      orderBy,
    });
  }
  return await prisma.estimateRequest.findMany({
    where,
    select,
    orderBy,
  });
}

// updateData
function updateData<T extends EstimateReqSelectType>({
  where,
  data,
  select,
  tx,
}: {
  where: EstimateReqWhereUniqueInputType;
  data: EstimateReqUpdateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<EstimateReqPayload<T>>;
function updateData({
  where,
  data,
  tx,
}: {
  where: EstimateReqWhereUniqueInputType;
  data: EstimateReqUpdateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<EstimateReqPayload<undefined>>;

async function updateData<T extends EstimateReqSelectType | undefined>({
  where,
  data,
  select,
  tx,
}: {
  where: EstimateReqWhereUniqueInputType;
  data: EstimateReqUpdateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.estimateRequest.update({ where, data });
  }
  return await db.estimateRequest.update({ where, data, select });
}

// deleteData
async function deleteData(
  where: { id: number },
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx || prisma;
  await db.estimateRequest.delete({ where });
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
