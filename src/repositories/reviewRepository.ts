import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type ReviewSelectType = Prisma.ReviewSelect;

type ReviewPayload<T extends ReviewSelectType | undefined> =
  Prisma.ReviewGetPayload<{ select: T }>;

interface ReviewPagenationParams extends PagenationParamsByPage {
  where?: Prisma.ReviewWhereInput;
}

type ReviewUncheckedCreateInputTrype =
  Prisma.ReviewUncheckedCreateInput;

type ReviewWhereInputType = Prisma.ReviewWhereInput;

type ReviewWhereUniqueInputType = Prisma.ReviewWhereUniqueInput;

type ReviewUpdateInputType = Prisma.ReviewUpdateInput;

// createData
function createData<T extends ReviewSelectType>({
  data,
  select,
}: {
  data: ReviewUncheckedCreateInputTrype;
  select: T;
}): Promise<ReviewPayload<T>>;
function createData({
  data,
}: {
  data: ReviewUncheckedCreateInputTrype;
}): Promise<ReviewPayload<undefined>>;

async function createData<T extends ReviewSelectType | undefined>({
  data,
  select,
}: {
  data: ReviewUncheckedCreateInputTrype;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.review.create({ data });
  }
  return await prisma.review.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends ReviewSelectType>({
  where,
  select,
}: {
  where: ReviewWhereInputType;
  select: T;
}): Promise<ReviewPayload<T> | null>;
function findFirstData({
  where,
}: {
  where: ReviewWhereInputType;
}): Promise<ReviewPayload<undefined> | null>;

async function findFirstData<T extends ReviewSelectType | undefined>({
  where,
  select,
}: {
  where: ReviewWhereInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.review.findFirst({ where });
  }
  return await prisma.review.findFirst({
    where,
    select,
  });
}

// findUniqueOrThrowtData
function findUniqueOrThrowtData<T extends ReviewSelectType>({
  where,
  select,
}: {
  where: ReviewWhereUniqueInputType;
  select: T;
}): Promise<ReviewPayload<T>>;
function findUniqueOrThrowtData({
  where,
}: {
  where: ReviewWhereUniqueInputType;
}): Promise<ReviewPayload<undefined>>;

async function findUniqueOrThrowtData<
  T extends ReviewSelectType | undefined
>({ where, select }: { where: ReviewWhereUniqueInputType; select?: T }) {
  if (select === undefined) {
    return await prisma.review.findUniqueOrThrow({ where });
  }
  return await prisma.review.findUniqueOrThrow({
    where,
    select,
  });
}

// countData
async function countData(where: ReviewWhereInputType): Promise<number> {
  return await prisma.review.count({ where });
}

// findManyByPaginationData
function findManyByPaginationData<T extends ReviewSelectType>({
  paginationParams,
  select,
}: {
  paginationParams: ReviewPagenationParams;
  select: T;
}): Promise<ReviewPayload<T>[]>;
function findManyByPaginationData({
  paginationParams,
}: {
  paginationParams: ReviewPagenationParams;
}): Promise<ReviewPayload<undefined>[]>;

async function findManyByPaginationData<
  T extends ReviewSelectType | undefined
>({
  paginationParams,
  select,
}: {
  paginationParams: ReviewPagenationParams;
  select?: T;
}) {
  const { orderBy, skip, take, where } = paginationParams;
  if (select === undefined) {
    return await prisma.review.findMany({
      orderBy,
      skip,
      take,
      where,
    });
  }
  return await prisma.review.findMany({
    orderBy,
    skip,
    take,
    where,
    select,
  });
}

// updateData
function updateData<T extends ReviewSelectType>({
  where,
  data,
  select,
}: {
  where: ReviewWhereUniqueInputType;
  data: ReviewUpdateInputType;
  select: T;
}): Promise<ReviewPayload<T>>;
function updateData({
  where,
  data,
}: {
  where: ReviewWhereUniqueInputType;
  data: ReviewUpdateInputType;
}): Promise<ReviewPayload<undefined>>;

async function updateData<T extends ReviewSelectType | undefined>({
  where,
  data,
  select,
}: {
  where: ReviewWhereUniqueInputType;
  data: ReviewUpdateInputType;
  select?: T;
}) {
  if (select === undefined) {
    return await prisma.review.update({ where, data });
  }
  return await prisma.review.update({ where, data, select });
}

// deleteData
async function deleteData(where: { id: number }): Promise<void> {
  await prisma.review.delete({ where });
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
