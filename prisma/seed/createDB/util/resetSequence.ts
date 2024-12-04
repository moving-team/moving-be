import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ID 시퀀스를 특정 값으로 초기화합니다.
 * @param startId 초기화할 ID 값
 */
export async function resetUserSequence(startId: number) {
  try {
    console.log(`Resetting User ID sequence to start from ${startId}...`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE user_id_seq RESTART WITH ${startId}`);
    console.log(`User ID sequence reset to start from ${startId}.`);
  } catch (error) {
    console.error('Error resetting sequence:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

export async function resetMoverSequence(startId: number) {
  try {
    console.log(`Resetting Mover ID sequence to start from ${startId}...`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE mover_id_seq RESTART WITH ${startId}`);
    console.log(`Mover ID sequence reset to start from ${startId}.`);
  } catch (error) {
    console.error('Error resetting sequence:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}


export async function resetCustomerSequence(startId: number) {
  try {
    console.log(`Resetting Mover ID sequence to start from ${startId}...`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE customer_id_seq RESTART WITH ${startId}`);
    console.log(`Mover ID sequence reset to start from ${startId}.`);
  } catch (error) {
    console.error('Error resetting sequence:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

export async function resetMovingInfoSequence(startId: number) {
  try {
    console.log(`Resetting Mover ID sequence to start from ${startId}...`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE moving_info_id_seq RESTART WITH ${startId}`);
    console.log(`Mover ID sequence reset to start from ${startId}.`);
  } catch (error) {
    console.error('Error resetting sequence:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

export async function resetEstimateSequence(startId: number) {
  try {
    console.log(`Resetting Mover ID sequence to start from ${startId}...`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE estimate_id_seq RESTART WITH ${startId}`);
    console.log(`Mover ID sequence reset to start from ${startId}.`);
  } catch (error) {
    console.error('Error resetting sequence:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}
