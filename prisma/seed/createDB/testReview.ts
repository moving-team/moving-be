import * as fs from "fs";
import * as readline from "readline";

type Review = {
  estimateId: number;
  customerId: number;
  moverId: number;
  score: number;
  description: string;
  createdAt: Date;
};

async function testMoverReviews() {
  // JSON 파일에서 리뷰 데이터 로드
  const reviews: Review[] = JSON.parse(
    fs.readFileSync("./data/reviews.json", "utf-8")
  );

  // Readline 인터페이스 생성
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "moverId 입력 (종료: CTRL+C): ",
  });

  rl.prompt();

  rl.on("line", (input) => {
    const moverId = parseInt(input.trim(), 10);

    if (isNaN(moverId)) {
      console.log("유효한 moverId를 입력하세요.");
    } else {
      // 해당 moverId로 리뷰 필터링
      const moverReviews = reviews.filter((review) => review.moverId === moverId);

      if (moverReviews.length === 0) {
        console.log(`moverId(${moverId})로 조회된 리뷰가 없습니다.`);
      } else {
        // 총 리뷰 갯수
        const totalReviews = moverReviews.length;

        // 평균 평점
        const averageScore =
          moverReviews.reduce((sum, review) => sum + review.score, 0) /
          totalReviews;

        // 평점 숫자별 리뷰 갯수
        const scoreCounts = moverReviews.reduce((acc, review) => {
          acc[review.score] = (acc[review.score] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        console.log(`\n--- Mover 리뷰 정보 (moverId: ${moverId}) ---`);
        console.log(`총 리뷰 갯수: ${totalReviews}`);
        console.log(`평균 평점: ${averageScore.toFixed(2)}\n`);

        console.log("--- 평점별 리뷰 갯수 ---");
        console.table(
          Array.from({ length: 5 }, (_, i) => ({
            점수: i + 1,
            리뷰_갯수: scoreCounts[i + 1] || 0,
          }))
        );

        console.log(
          "\n♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠"
        );
      }
    }

    rl.prompt(); // 다시 입력 대기
  });

  rl.on("close", () => {
    console.log("프로그램을 종료합니다.");
  });
}

testMoverReviews();
