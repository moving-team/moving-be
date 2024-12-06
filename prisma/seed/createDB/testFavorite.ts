import fs from 'fs/promises';
import readline from 'readline';

async function loadFavoriteData() {
  try {
    const filePath = './data/favorite.json';
    const fileData = await fs.readFile(filePath, 'utf-8');
    const favoriteData = JSON.parse(fileData);

    if (!Array.isArray(favoriteData) || favoriteData.length === 0) {
      console.log("JSON 파일에 즐겨찾기 데이터가 없습니다.");
      return null;
    }

    return favoriteData;
  } catch (error) {
    console.error("즐겨찾기 데이터를 읽는 중 오류가 발생했습니다:", error);
    return null;
  }
}

async function runMoverFavoriteCount() {
  const favoriteData = await loadFavoriteData();
  if (!favoriteData) {
    console.log("즐겨찾기 데이터를 불러오지 못했습니다. 프로그램을 종료합니다.");
    return;
  }

  console.log(`총 ${favoriteData.length}개의 즐겨찾기 데이터를 불러왔습니다.`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("moverId를 입력하세요 (종료: Ctrl+C)");

  rl.on('line', (input) => {
    const moverId = parseInt(input.trim(), 10);

    if (isNaN(moverId)) {
      console.log("유효한 moverId를 입력해주세요.");
      return;
    }

    const count = favoriteData.filter((favorite) => favorite.moverId === moverId).length;

    console.log(`Mover ID ${moverId}은(는) ${count}개의 즐겨찾기를 가지고 있습니다.`);
  });

  rl.on('SIGINT', () => {
    console.log("\n프로그램을 종료합니다.");
    rl.close();
    process.exit(0);
  });
}

runMoverFavoriteCount();
