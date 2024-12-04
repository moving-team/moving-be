import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type FavoriteSelectType = Prisma.FavoriteSelect;

type FavoritePayload<T extends FavoriteSelectType | undefined> =
  Prisma.FavoriteGetPayload<{ select: T }>;

interface FavoritePagenationParams extends PagenationParamsByPage {
  where?: Prisma.FavoriteWhereInput;
}

type FavoriteUncheckedCreateInputType = Prisma.FavoriteUncheckedCreateInput;

type FavoriteWhereInputType = Prisma.FavoriteWhereInput;

type FavoriteWhereUniqueInputType = Prisma.FavoriteWhereUniqueInput;

type FavoriteUpdateInputType = Prisma.FavoriteUpdateInput;

type FavoriteOrderByType = Prisma.FavoriteOrderByWithRelationInput;

// createData
function createData<T extends FavoriteSelectType>({
  data,
  select,
}: {
  data: FavoriteUncheckedCreateInputType;
  select: T;
}): Promise<FavoritePayload<T>>;
function createData({
  data,
}: {
  data: FavoriteUncheckedCreateInputType;
}): Promise<FavoritePayload<undefined>>;

async function createData<T extends FavoriteSelectType | undefined>({
  data,
  select,
}: {
  data: FavoriteUncheckedCreateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.favorite.create({ data });
  }
  return await prisma.favorite.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends FavoriteSelectType>({
  where,
  select,
  orderBy,
}: {
  where: FavoriteWhereInputType;
  select: T;
  orderBy?: FavoriteOrderByType;
}): Promise<FavoritePayload<T> | null>;
function findFirstData({
  where,
  orderBy,
}: {
  where: FavoriteWhereInputType;
  orderBy?: FavoriteOrderByType;
}): Promise<FavoritePayload<undefined> | null>;

async function findFirstData<T extends FavoriteSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: FavoriteWhereInputType;
  select?: T;
  orderBy?: FavoriteOrderByType;
}) {
  if (select === undefined) {
    return await prisma.favorite.findFirst({ where, orderBy });
  }
  return await prisma.favorite.findFirst({
    where,
    select,
    orderBy,
  });
}

// findUniqueOrThrowtData
function findUniqueOrThrowtData<T extends FavoriteSelectType>({
  where,
  select,
}: {
  where: FavoriteWhereUniqueInputType;
  select: T;
}): Promise<FavoritePayload<T>>;
function findUniqueOrThrowtData({
  where,
}: {
  where: FavoriteWhereUniqueInputType;
}): Promise<FavoritePayload<undefined>>;

async function findUniqueOrThrowtData<
  T extends FavoriteSelectType | undefined
>({ where, select }: { where: FavoriteWhereUniqueInputType; select?: T }) {
  if (select === undefined) {
    return await prisma.favorite.findUniqueOrThrow({ where });
  }
  return await prisma.favorite.findUniqueOrThrow({
    where,
    select,
  });
}

// countData
async function countData(where: FavoriteWhereInputType): Promise<number> {
  return await prisma.favorite.count({ where });
}

// findManyByPaginationData
function findManyByPaginationData<T extends FavoriteSelectType>({
  paginationParams,
  select,
}: {
  paginationParams: FavoritePagenationParams;
  select: T;
}): Promise<FavoritePayload<T>[]>;
function findManyByPaginationData({
  paginationParams,
}: {
  paginationParams: FavoritePagenationParams;
}): Promise<FavoritePayload<undefined>[]>;

async function findManyByPaginationData<
  T extends FavoriteSelectType | undefined
>({
  paginationParams,
  select,
}: {
  paginationParams: FavoritePagenationParams;
  select?: T;
}) {
  const { orderBy, skip, take, where } = paginationParams;
  if (select === undefined) {
    return await prisma.favorite.findMany({
      orderBy,
      skip,
      take,
      where,
    });
  }
  return await prisma.favorite.findMany({
    orderBy,
    skip,
    take,
    where,
    select,
  });
}

// updateData
function updateData<T extends FavoriteSelectType>({
  where,
  data,
  select,
}: {
  where: FavoriteWhereUniqueInputType;
  data: FavoriteUpdateInputType;
  select: T;
}): Promise<FavoritePayload<T>>;
function updateData({
  where,
  data,
}: {
  where: FavoriteWhereUniqueInputType;
  data: FavoriteUpdateInputType;
}): Promise<FavoritePayload<undefined>>;

async function updateData<T extends FavoriteSelectType | undefined>({
  where,
  data,
  select,
}: {
  where: FavoriteWhereUniqueInputType;
  data: FavoriteUpdateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.favorite.update({ where, data });
  }
  return await prisma.favorite.update({ where, data, select });
}

// deleteData
async function deleteData(where: { id: number }): Promise<void> {
  await prisma.favorite.delete({ where });
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
