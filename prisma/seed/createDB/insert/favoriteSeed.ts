import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

async function insertFavoritesFromJson() {
  try {
    // JSON 파일 읽기
    const filePath = '../data/favorite.json';
    const fileData = await fs.readFile(filePath, 'utf-8');
    const favoriteData = JSON.parse(fileData);

    if (!Array.isArray(favoriteData) || favoriteData.length === 0) {
      console.log("No data found in the JSON file.");
      return;
    }

    console.log(`Inserting ${favoriteData.length} favorites into the database...`);

    // DB에 데이터 삽입
    await prisma.favorite.createMany({
      data: favoriteData.map((favorite: any) => ({
        customerId: favorite.customerId,
        moverId: favorite.moverId,
      })),
      skipDuplicates: true, // 중복 데이터는 무시
    });

    console.log("All favorites inserted successfully.");
  } catch (error) {
    console.error("Error inserting favorites:", error);
  } finally {
    await prisma.$disconnect();
  }
}

insertFavoritesFromJson();
