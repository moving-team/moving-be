import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type MoverSelectType = Prisma.MoverSelect;

type MoverPayload<T extends MoverSelectType | undefined> =
  Prisma.MoverGetPayload<{ select: T }>;

interface MoverPagenationParams extends PagenationParamsByPage {
  where?: Prisma.MoverWhereInput;
}

type MoverUncheckedCreateInputTrype = Prisma.MoverUncheckedCreateInput;

type MoverWhereInputType = Prisma.MoverWhereInput;

type MoverWhereUniqueInputType = Prisma.MoverWhereUniqueInput;

type MoverUpdateInputType = Prisma.MoverUpdateInput;

// createData
function createData<T extends MoverSelectType>({
  data,
  select,
}: {
  data: MoverUncheckedCreateInputTrype;
  select: T;
}): Promise<MoverPayload<T>>;
function createData({
  data,
}: {
  data: MoverUncheckedCreateInputTrype;
}): Promise<MoverPayload<undefined>>;

async function createData<T extends MoverSelectType | undefined>({
  data,
  select,
}: {
  data: MoverUncheckedCreateInputTrype;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.mover.create({ data });
  }
  return await prisma.mover.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends MoverSelectType>({
  where,
  select,
}: {
  where: MoverWhereInputType;
  select: T;
}): Promise<MoverPayload<T> | null>;
function findFirstData({
  where,
}: {
  where: MoverWhereInputType;
}): Promise<MoverPayload<undefined> | null>;

async function findFirstData<T extends MoverSelectType | undefined>({
  where,
  select,
}: {
  where: MoverWhereInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.mover.findFirst({ where });
  }
  return await prisma.mover.findFirst({
    where,
    select,
  });
}

// findUniqueOrThrowtData
function findUniqueOrThrowtData<T extends MoverSelectType>({
  where,
  select,
}: {
  where: MoverWhereUniqueInputType;
  select: T;
}): Promise<MoverPayload<T>>;
function findUniqueOrThrowtData({
  where,
}: {
  where: MoverWhereUniqueInputType;
}): Promise<MoverPayload<undefined>>;

async function findUniqueOrThrowtData<T extends MoverSelectType | undefined>({
  where,
  select,
}: {
  where: MoverWhereUniqueInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.mover.findUniqueOrThrow({ where });
  }
  return await prisma.mover.findUniqueOrThrow({
    where,
    select,
  });
}

// countData
async function countData(where: MoverWhereInputType): Promise<number> {
  return await prisma.mover.count({ where });
}

// findManyByPaginationData
function findManyByPaginationData<T extends MoverSelectType>({
  paginationParams,
  select,
}: {
  paginationParams: MoverPagenationParams;
  select: T;
}): Promise<MoverPayload<T>[]>;
function findManyByPaginationData({
  paginationParams,
}: {
  paginationParams: MoverPagenationParams;
}): Promise<MoverPayload<undefined>[]>;

async function findManyByPaginationData<T extends MoverSelectType | undefined>({
  paginationParams,
  select,
}: {
  paginationParams: MoverPagenationParams;
  select?: T;
}) {
  const { orderBy, skip, take, where } = paginationParams;
  if (select === undefined) {
    return await prisma.mover.findMany({
      orderBy,
      skip,
      take,
      where,
    });
  }
  return await prisma.mover.findMany({
    orderBy,
    skip,
    take,
    where,
    select,
  });
}

// updateData
function updateData<T extends MoverSelectType>({
  where,
  data,
  select,
}: {
  where: MoverWhereUniqueInputType;
  data: MoverUpdateInputType;
  select: T;
}): Promise<MoverPayload<T>>;
function updateData({
  where,
  data,
}: {
  where: MoverWhereUniqueInputType;
  data: MoverUpdateInputType;
}): Promise<MoverPayload<undefined>>;

async function updateData<T extends MoverSelectType | undefined>({
  where,
  data,
  select,
}: {
  where: MoverWhereUniqueInputType;
  data: MoverUpdateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.mover.update({ where, data });
  }
  return await prisma.mover.update({ where, data, select });
}

// deleteData
async function deleteData(where: { id: number }): Promise<void> {
  await prisma.mover.delete({ where });
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
