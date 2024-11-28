import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type MovingInfoSelectType = Prisma.MovingInfoSelect;

type MovingInfoPayload<T extends MovingInfoSelectType | undefined> =
  Prisma.MovingInfoGetPayload<{ select: T }>;

interface MovingInfoPagenationParams extends PagenationParamsByPage {
  where?: Prisma.MovingInfoWhereInput;
}

type MovingInfoUncheckedCreateInputTrype =
  Prisma.MovingInfoUncheckedCreateInput;

type MovingInfoWhereInputType = Prisma.MovingInfoWhereInput;

type MovingInfoWhereUniqueInputType = Prisma.MovingInfoWhereUniqueInput;

type MovingInfoUpdateInputType = Prisma.MovingInfoUpdateInput;

// createData
function createData<T extends MovingInfoSelectType>({
  data,
  select,
}: {
  data: MovingInfoUncheckedCreateInputTrype;
  select: T;
}): Promise<MovingInfoPayload<T>>;
function createData({
  data,
}: {
  data: MovingInfoUncheckedCreateInputTrype;
}): Promise<MovingInfoPayload<undefined>>;

async function createData<T extends MovingInfoSelectType | undefined>({
  data,
  select,
}: {
  data: MovingInfoUncheckedCreateInputTrype;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.movingInfo.create({ data });
  }
  return await prisma.movingInfo.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends MovingInfoSelectType>({
  where,
  select,
}: {
  where: MovingInfoWhereInputType;
  select: T;
}): Promise<MovingInfoPayload<T> | null>;
function findFirstData({
  where,
}: {
  where: MovingInfoWhereInputType;
}): Promise<MovingInfoPayload<undefined> | null>;

async function findFirstData<T extends MovingInfoSelectType | undefined>({
  where,
  select,
}: {
  where: MovingInfoWhereInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.movingInfo.findFirst({ where });
  }
  return await prisma.movingInfo.findFirst({
    where,
    select,
  });
}

// findUniqueOrThrowtData
function findUniqueOrThrowtData<T extends MovingInfoSelectType>({
  where,
  select,
}: {
  where: MovingInfoWhereUniqueInputType;
  select: T;
}): Promise<MovingInfoPayload<T>>;
function findUniqueOrThrowtData({
  where,
}: {
  where: MovingInfoWhereUniqueInputType;
}): Promise<MovingInfoPayload<undefined>>;

async function findUniqueOrThrowtData<
  T extends MovingInfoSelectType | undefined
>({ where, select }: { where: MovingInfoWhereUniqueInputType; select?: T }) {
  if (select === undefined) {
    return await prisma.movingInfo.findUniqueOrThrow({ where });
  }
  return await prisma.movingInfo.findUniqueOrThrow({
    where,
    select,
  });
}

// countData
async function countData(where: MovingInfoWhereInputType): Promise<number> {
  return await prisma.movingInfo.count({ where });
}

// findManyByPaginationData
function findManyByPaginationData<T extends MovingInfoSelectType>({
  paginationParams,
  select,
}: {
  paginationParams: MovingInfoPagenationParams;
  select: T;
}): Promise<MovingInfoPayload<T>[]>;
function findManyByPaginationData({
  paginationParams,
}: {
  paginationParams: MovingInfoPagenationParams;
}): Promise<MovingInfoPayload<undefined>[]>;

async function findManyByPaginationData<
  T extends MovingInfoSelectType | undefined
>({
  paginationParams,
  select,
}: {
  paginationParams: MovingInfoPagenationParams;
  select?: T;
}) {
  const { orderBy, skip, take, where } = paginationParams;
  if (select === undefined) {
    return await prisma.movingInfo.findMany({
      orderBy,
      skip,
      take,
      where,
    });
  }
  return await prisma.movingInfo.findMany({
    orderBy,
    skip,
    take,
    where,
    select,
  });
}

// updateData
function updateData<T extends MovingInfoSelectType>({
  where,
  data,
  select,
}: {
  where: MovingInfoWhereUniqueInputType;
  data: MovingInfoUpdateInputType;
  select: T;
}): Promise<MovingInfoPayload<T>>;
function updateData({
  where,
  data,
}: {
  where: MovingInfoWhereUniqueInputType;
  data: MovingInfoUpdateInputType;
}): Promise<MovingInfoPayload<undefined>>;

async function updateData<T extends MovingInfoSelectType | undefined>({
  where,
  data,
  select,
}: {
  where: MovingInfoWhereUniqueInputType;
  data: MovingInfoUpdateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.movingInfo.update({ where, data });
  }
  return await prisma.movingInfo.update({ where, data, select });
}

// deleteData
async function deleteData(where: { id: number }): Promise<void> {
  await prisma.movingInfo.delete({ where });
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
