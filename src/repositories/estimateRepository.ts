import prisma from '../config/prisma';
import { EstimatePagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type EstimateSelectType = Prisma.EstimateSelect;

type EstimatePayload<T extends EstimateSelectType | undefined> =
  Prisma.EstimateGetPayload<{ select: T }>;

interface EstimatePagenationParams extends EstimatePagenationParamsByPage {
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
  tx,
}: {
  data: EstimateUncheckedCreateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<EstimatePayload<T>>;
function createData({
  data,
  tx,
}: {
  data: EstimateUncheckedCreateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<EstimatePayload<undefined>>;

async function createData<T extends EstimateSelectType | undefined>({
  data,
  select,
  tx,
}: {
  data: EstimateUncheckedCreateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.estimate.create({ data });
  }
  return await db.estimate.create({
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

//findManyData
function findManyData<T extends EstimateSelectType>({
  where,
  select,
  orderBy,
}: {
  where: EstimateWhereInputType;
  select: T;
  orderBy?: EstimateOrderByType[] | EstimateOrderByType;
}): Promise<EstimatePayload<T>[]>;
function findManyData({
  where,
  orderBy,
}: {
  where: EstimateWhereInputType;
  orderBy?: EstimateOrderByType[] | EstimateOrderByType;
}): Promise<EstimatePayload<undefined>[]>;

async function findManyData<T extends EstimateSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: EstimateWhereInputType;
  select?: T;
  orderBy?: EstimateOrderByType[] | EstimateOrderByType;
}) {
  if (select === undefined) {
    return await prisma.estimate.findMany({
      where,
      orderBy,
    });
  }
  return await prisma.estimate.findMany({
    where,
    select,
    orderBy,
  });
}

// updateData
function updateData<T extends EstimateSelectType>({
  where,
  data,
  select,
  tx,
}: {
  where: EstimateWhereUniqueInputType;
  data: EstimateUpdateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<EstimatePayload<T>>;
function updateData({
  where,
  data,
  tx,
}: {
  where: EstimateWhereUniqueInputType;
  data: EstimateUpdateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<EstimatePayload<undefined>>;

async function updateData<T extends EstimateSelectType | undefined>({
  where,
  data,
  select,
  tx,
}: {
  where: EstimateWhereUniqueInputType;
  data: EstimateUpdateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.estimate.update({ where, data });
  }
  return await db.estimate.update({ where, data, select });
}

// deleteData
async function deleteData(
  where: { id: number },
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx || prisma;
  await db.estimate.delete({ where });
}

// groupByData 함수 정의
export async function groupByData({
  where,
  by,
  _count,
  _avg,
  _sum,
  _min,
  _max,
  orderBy,
  having,
  take,
  skip,
}: {
  where: Prisma.EstimateWhereInput;
  by: Prisma.EstimateScalarFieldEnum[];
  _count?: Prisma.EstimateCountAggregateInputType;
  _avg?: Prisma.EstimateAvgAggregateInputType;
  _sum?: Prisma.EstimateSumAggregateInputType;
  _min?: Prisma.EstimateMinAggregateInputType;
  _max?: Prisma.EstimateMaxAggregateInputType;
  orderBy:
    | Prisma.EstimateOrderByWithAggregationInput
    | Prisma.EstimateOrderByWithAggregationInput[]; // 필수로 설정
  having?: Prisma.EstimateScalarWhereWithAggregatesInput;
  take?: number;
  skip?: number;
}) {
  if (!orderBy) {
    throw new Error('orderBy is required'); // orderBy가 없으면 에러 발생
  }

  const groupByOptions = {
    where,
    by,
    ...(!!_count && { _count }),
    ...(!!_avg && { _avg }),
    ...(!!_sum && { _sum }),
    ...(!!_min && { _min }),
    ...(!!_max && { _max }),
    orderBy, // 필수로 설정
    ...(having && { having }),
    ...(take && { take }),
    ...(skip && { skip }),
  };

  // Prisma의 groupBy 메서드 호출
  return await prisma.estimate.groupBy(groupByOptions); // 타입 오류 해결
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
  groupByData,
};
