import prisma from '../config/prisma';
import { PagenationParamsByPage } from '../types/repositoryType';
import { Prisma } from '@prisma/client';

type NotificationSelectType = Prisma.NotificationSelect;

type NotificationPayload<T extends NotificationSelectType | undefined> =
  Prisma.NotificationGetPayload<{ select: T }>;

interface NotificationPagenationParams extends PagenationParamsByPage {
  where?: Prisma.NotificationWhereInput;
}

type NotificationUncheckedCreateInputType =
  Prisma.NotificationUncheckedCreateInput;

type NotificationWhereInputType = Prisma.NotificationWhereInput;

type NotificationWhereUniqueInputType = Prisma.NotificationWhereUniqueInput;

type NotificationUpdateInputType = Prisma.NotificationUpdateInput;

type NotificationOrderByType = Prisma.NotificationOrderByWithRelationInput;

// createData
function createData<T extends NotificationSelectType>({
  data,
  select,
  tx,
}: {
  data: NotificationUncheckedCreateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<NotificationPayload<T>>;
function createData({
  data,
  tx,
}: {
  data: NotificationUncheckedCreateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<NotificationPayload<undefined>>;

async function createData<T extends NotificationSelectType | undefined>({
  data,
  select,
  tx,
}: {
  data: NotificationUncheckedCreateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.notification.create({ data });
  }
  return await db.notification.create({
    data,
    select,
  });
}

// findFirstData
function findFirstData<T extends NotificationSelectType>({
  where,
  select,
  orderBy,
}: {
  where: NotificationWhereInputType;
  select: T;
  orderBy?: NotificationOrderByType;
}): Promise<NotificationPayload<T> | null>;
function findFirstData({
  where,
  orderBy,
}: {
  where: NotificationWhereInputType;
  orderBy?: NotificationOrderByType;
}): Promise<NotificationPayload<undefined> | null>;

async function findFirstData<T extends NotificationSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: NotificationWhereInputType;
  select?: T;
  orderBy?: NotificationOrderByType;
}) {
  if (select === undefined) {
    return await prisma.notification.findFirst({ where, orderBy });
  }
  return await prisma.notification.findFirst({
    where,
    select,
    orderBy,
  });
}

// findUniqueOrThrowtData
function findUniqueOrThrowtData<T extends NotificationSelectType>({
  where,
  select,
}: {
  where: NotificationWhereUniqueInputType;
  select: T;
}): Promise<NotificationPayload<T>>;
function findUniqueOrThrowtData({
  where,
}: {
  where: NotificationWhereUniqueInputType;
}): Promise<NotificationPayload<undefined>>;

async function findUniqueOrThrowtData<
  T extends NotificationSelectType | undefined
>({ where, select }: { where: NotificationWhereUniqueInputType; select?: T }) {
  if (select === undefined) {
    return await prisma.notification.findUniqueOrThrow({ where });
  }
  return await prisma.notification.findUniqueOrThrow({
    where,
    select,
  });
}

// countData
async function countData(where: NotificationWhereInputType): Promise<number> {
  return await prisma.notification.count({ where });
}

// findManyByPaginationData
function findManyByPaginationData<T extends NotificationSelectType>({
  paginationParams,
  select,
}: {
  paginationParams: NotificationPagenationParams;
  select: T;
}): Promise<NotificationPayload<T>[]>;
function findManyByPaginationData({
  paginationParams,
}: {
  paginationParams: NotificationPagenationParams;
}): Promise<NotificationPayload<undefined>[]>;

async function findManyByPaginationData<
  T extends NotificationSelectType | undefined
>({
  paginationParams,
  select,
}: {
  paginationParams: NotificationPagenationParams;
  select?: T;
}) {
  const { orderBy, skip, take, where } = paginationParams;
  if (select === undefined) {
    return await prisma.notification.findMany({
      orderBy,
      skip,
      take,
      where,
    });
  }
  return await prisma.notification.findMany({
    orderBy,
    skip,
    take,
    where,
    select,
  });
}

//findManyData
function findManyData<T extends NotificationSelectType>({
  where,
  select,
  orderBy,
}: {
  where: NotificationWhereInputType;
  select: T;
  orderBy?: NotificationOrderByType;
}): Promise<NotificationPayload<T>[]>;
function findManyData({
  where,
  orderBy,
}: {
  where: NotificationWhereInputType;
  orderBy?: NotificationOrderByType;
}): Promise<NotificationPayload<undefined>[]>;

async function findManyData<T extends NotificationSelectType | undefined>({
  where,
  select,
  orderBy = { createdAt: 'desc' },
}: {
  where: NotificationWhereInputType;
  select?: T;
  orderBy?: NotificationOrderByType;
}) {
  if (select === undefined) {
    return await prisma.notification.findMany({
      where,
      orderBy,
    });
  }
  return await prisma.notification.findMany({
    where,
    select,
    orderBy,
  });
}

// updateData
function updateData<T extends NotificationSelectType>({
  where,
  data,
  select,
  tx,
}: {
  where: NotificationWhereUniqueInputType;
  data: NotificationUpdateInputType;
  select: T;
  tx?: Prisma.TransactionClient;
}): Promise<NotificationPayload<T>>;
function updateData({
  where,
  data,
  tx,
}: {
  where: NotificationWhereUniqueInputType;
  data: NotificationUpdateInputType;
  tx?: Prisma.TransactionClient;
}): Promise<NotificationPayload<undefined>>;

async function updateData<T extends NotificationSelectType | undefined>({
  where,
  data,
  select,
  tx,
}: {
  where: NotificationWhereUniqueInputType;
  data: NotificationUpdateInputType;
  select?: T;
  tx?: Prisma.TransactionClient;
}) {
  const db = tx || prisma;
  if (select === undefined) {
    return await db.notification.update({ where, data });
  }
  return await db.notification.update({ where, data, select });
}

// deleteData
async function deleteData(
  where: { id: number },
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx || prisma;
  await db.notification.delete({ where });
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
