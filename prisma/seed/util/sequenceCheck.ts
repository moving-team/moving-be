import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function getAllSequences() {
  try {
    // 모든 시퀀스 가져오기
    const result = await prisma.$queryRaw<
      { sequence_name: string }[]
    >(
      Prisma.sql`SELECT sequence_name
                 FROM information_schema.sequences
                 WHERE sequence_schema = 'public';`
    );
    return result;
  } catch (error) {
    console.error('Error fetching sequences:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

getAllSequences().then((result) => {
  console.log('All sequences:', result);
});

// All sequences: [
//   { sequence_name: 'mover_id_seq' },
//   { sequence_name: 'user_id_seq' },
//   { sequence_name: 'customer_id_seq' },
//   { sequence_name: 'review_id_seq' },
//   { sequence_name: 'moving_info_id_seq' },
//   { sequence_name: 'estimate_requests_id_seq' },
//   { sequence_name: 'assigned_estimate_request_id_seq' },
//   { sequence_name: 'estimate_id_seq' },
//   { sequence_name: 'favorite_id_seq' },
//   { sequence_name: 'notification_id_seq' }
// ]