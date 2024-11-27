import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type EstimateReqSelectType = Prisma.EstimateRequestSelect;

type EstimateReqPayload<T extends EstimateReqSelectType | undefined> =
  Prisma.EstimateRequestGetPayload<{ select: T }>;

interface EstimateReqPagenationParams extends PagenationParamsByPage {
  where?: Prisma.EstimateRequestWhereInput;
}

type EstimateReqUncheckedCreateInputTrype =
  Prisma.EstimateRequestUncheckedCreateInput;

type EstimateReqWhereInputType = Prisma.EstimateRequestWhereInput;

type EstimateReqWhereUniqueInputType = Prisma.EstimateRequestWhereUniqueInput;

type EstimateReqUpdateInputType = Prisma.EstimateRequestUpdateInput;

// createData
function createData<T extends EstimateReqSelectType>({
  data,
  select,
}: {
  data: EstimateReqUncheckedCreateInputTrype;
  select: T;
}): Promise<EstimateReqPayload<T>>;
function createData({
  data,
}: {
  data: EstimateReqUncheckedCreateInputTrype;
}): Promise<EstimateReqPayload<undefined>>;

async function createData<T extends EstimateReqSelectType | undefined>({
  data,
  select,
}: {
  data: EstimateReqUncheckedCreateInputTrype;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.estimateRequest.create({ data });
  }
  return await prisma.estimateRequest.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends EstimateReqSelectType>({
  where,
  select,
}: {
  where: EstimateReqWhereInputType;
  select: T;
}): Promise<EstimateReqPayload<T> | null>;
function findFirstData({
  where,
}: {
  where: EstimateReqWhereInputType;
}): Promise<EstimateReqPayload<undefined> | null>;

async function findFirstData<T extends EstimateReqSelectType | undefined>({
  where,
  select,
}: {
  where: EstimateReqWhereInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.estimateRequest.findFirst({ where });
  }
  return await prisma.estimateRequest.findFirst({
    where,
    select,
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

// updateData
function updateData<T extends EstimateReqSelectType>({
  where,
  data,
  select,
}: {
  where: EstimateReqWhereUniqueInputType;
  data: EstimateReqUpdateInputType;
  select: T;
}): Promise<EstimateReqPayload<T>>;
function updateData({
  where,
  data,
}: {
  where: EstimateReqWhereUniqueInputType;
  data: EstimateReqUpdateInputType;
}): Promise<EstimateReqPayload<undefined>>;

async function updateData<T extends EstimateReqSelectType | undefined>({
  where,
  data,
  select,
}: {
  where: EstimateReqWhereUniqueInputType;
  data: EstimateReqUpdateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.estimateRequest.update({ where, data });
  }
  return await prisma.estimateRequest.update({ where, data, select });
}

// deleteData
async function deleteData(where: { id: number }): Promise<void> {
  await prisma.estimateRequest.delete({ where });
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
