import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateMoverConfirmationCount() {
  try {
    console.log('Updating mover confirmation counts...');

    // Step 1: Get the count of ACCEPTED estimates grouped by moverId
    const confirmationCounts = await prisma.estimate.groupBy({
      by: ['moverId'],
      _count: {
        status: true,
      },
      where: {
        status: 'ACCEPTED',
      },
    });

    console.log('Confirmation counts fetched:', confirmationCounts);

    // Step 2: Update the confirmationCount for each mover
    for (const { moverId, _count } of confirmationCounts) {
      await prisma.mover.update({
        where: { id: moverId },
        data: { confirmationCount: _count.status },
      });
    }

    console.log('Mover confirmation counts updated successfully.');
  } catch (error) {
    console.error('Error updating mover confirmation counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
updateMoverConfirmationCount();
