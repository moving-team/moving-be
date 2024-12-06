import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('Start seeding process...');

    // JSON 파일 경로
    const usersFilePath = '../data/users.json';
    const moversFilePath = '../data/movers.json';
    const customersFilePath = '../data/customers.json';

    // JSON 데이터 읽기
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    const movers = JSON.parse(fs.readFileSync(moversFilePath, 'utf-8'));
    const customers = JSON.parse(fs.readFileSync(customersFilePath, 'utf-8'));

    // 데이터 타입 검증
    if (!Array.isArray(users)) {
      throw new Error(`Invalid data format in ${usersFilePath}: Root should be an array.`);
    }
    if (!Array.isArray(movers)) {
      throw new Error(`Invalid data format in ${moversFilePath}: Root should be an array.`);
    }
    if (!Array.isArray(customers)) {
      throw new Error(`Invalid data format in ${customersFilePath}: Root should be an array.`);
    }

    // 데이터 삽입
    console.log(`Inserting ${users.length} users...`);
    if (users.length > 0) {
      await prisma.user.createMany({ data: users });
    }

    console.log(`Inserting ${movers.length} movers...`);
    if (movers.length > 0) {
      await prisma.mover.createMany({ data: movers });
    }

    console.log(`Inserting ${customers.length} customers...`);
    if (customers.length > 0) {
      await prisma.customer.createMany({ data: customers });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during seeding:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('An unknown error occurred:', error);
    }
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

seedDatabase();
