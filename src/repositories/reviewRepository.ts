import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type ReviewSelectType = Prisma.ReviewSelect;

type ReviewPayload<T extends ReviewSelectType | undefined> =
  Prisma.ReviewGetPayload<{ select: T }>;

interface ReviewPagenationParams extends PagenationParamsByPage {
  where?: Prisma.ReviewWhereInput;
}

type ReviewUncheckedCreateInputType = Prisma.ReviewUncheckedCreateInput;

type ReviewWhereInputType = Prisma.ReviewWhereInput;

type ReviewWhereUniqueInputType = Prisma.ReviewWhereUniqueInput;

type ReviewUpdateInputType = Prisma.ReviewUpdateInput;

type ReviewOrderByType = Prisma.ReviewOrderByWithRelationInput;

type AggregateResults = {
  _sum?: Prisma.ReviewSumAggregateOutputType;
  _avg?: Prisma.ReviewAvgAggregateOutputType;
  _count?: Prisma.ReviewCountAggregateOutputType;
  _min?: Prisma.ReviewMinAggregateOutputType;
  _max?: Prisma.ReviewMaxAggregateOutputType;
};

// createData
function createData<T extends ReviewSelectType>({
  data,
  select,
  tx,
}: {
  data: ReviewUncheckedCreateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<ReviewPayload<T>>;
function createData({
  data,
  tx,
}: {
  data: ReviewUncheckedCreateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<ReviewPayload<undefined>>;

async function createData<T extends ReviewSelectType | undefined>({
  data,
  select,
  tx,
}: {
  data: ReviewUncheckedCreateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.review.create({ data });
  }
  return await db.review.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends ReviewSelectType>({
  where,
  select,
  orderBy,
}: {
  where: ReviewWhereInputType;
  select: T;
  orderBy?: ReviewOrderByType;
}): Promise<ReviewPayload<T> | null>;
function findFirstData({
  where,
  orderBy,
}: {
  where: ReviewWhereInputType;
  orderBy?: ReviewOrderByType;
}): Promise<ReviewPayload<undefined> | null>;

async function findFirstData<T extends ReviewSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: ReviewWhereInputType;
  select?: T;
  orderBy?: ReviewOrderByType;
}) {
  if (select === undefined) {
    return await prisma.review.findFirst({ where, orderBy });
  }
  return await prisma.review.findFirst({
    where,
    select,
    orderBy,
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

async function findUniqueOrThrowtData<T extends ReviewSelectType | undefined>({
  where,
  select,
}: {
  where: ReviewWhereUniqueInputType;
  select?: T;
}) {
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

//findManyData
function findManyData<T extends ReviewSelectType>({
  where,
  select,
  orderBy,
}: {
  where: ReviewWhereInputType;
  select: T;
  orderBy?: ReviewOrderByType;
}): Promise<ReviewPayload<T>[]>;
function findManyData({
  where,
  orderBy,
}: {
  where: ReviewWhereInputType;
  orderBy?: ReviewOrderByType;
}): Promise<ReviewPayload<undefined>[]>;

async function findManyData<T extends ReviewSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: ReviewWhereInputType;
  select?: T;
  orderBy?: ReviewOrderByType;
}) {
  if (select === undefined) {
    return await prisma.review.findMany({
      where,
      orderBy,
    });
  }
  return await prisma.review.findMany({
    where,
    select,
    orderBy,
  });
}

// updateData
function updateData<T extends ReviewSelectType>({
  where,
  data,
  select,
  tx,
}: {
  where: ReviewWhereUniqueInputType;
  data: ReviewUpdateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<ReviewPayload<T>>;
function updateData({
  where,
  data,
  tx,
}: {
  where: ReviewWhereUniqueInputType;
  data: ReviewUpdateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<ReviewPayload<undefined>>;

async function updateData<T extends ReviewSelectType | undefined>({
  where,
  data,
  select,
  tx,
}: {
  where: ReviewWhereUniqueInputType;
  data: ReviewUpdateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.review.update({ where, data });
  }
  return await db.review.update({ where, data, select });
}

// deleteData
async function deleteData(
  where: { id: number },
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx || prisma;
  await db.review.delete({ where });
}
// aggregate 사용
async function aggregateData({
  where,
  _sum,
  _count,
  _avg,
  _min,
  _max,
}: {
  where: Prisma.ReviewWhereInput;
  _sum?: Prisma.ReviewSumAggregateInputType;
  _count?: Prisma.ReviewCountAggregateInputType;
  _avg?: Prisma.ReviewAvgAggregateInputType;
  _min?: Prisma.ReviewMinAggregateInputType;
  _max?: Prisma.ReviewMaxAggregateInputType;
}): Promise<AggregateResults> {
  const aggregateOptions: Prisma.ReviewAggregateArgs = {
    where,
    ...(!!_sum && { _sum }),
    ...(!!_count && { _count }),
    ...(!!_avg && { _avg }),
    ...(!!_min && { _min }),
    ...(!!_max && { _max }),
  };

  return (await prisma.review.aggregate(aggregateOptions)) as AggregateResults;
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
  aggregateData,
};
