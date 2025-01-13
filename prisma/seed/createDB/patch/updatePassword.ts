import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const updatePasswords = async () => {
  try {
    const plainPassword = "qwer1234!";
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const updatedUsers = await prisma.user.updateMany({
      data: {
        password: hashedPassword,
      },
    });

    console.log(`${updatedUsers.count}명의 사용자의 비밀번호가 업데이트되었습니다.`);
  } catch (error) {
    console.error("비밀번호 업데이트 중 오류 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
};

updatePasswords();