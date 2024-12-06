/*
  Warnings:

  - Changed the type of `moving_date` on the `moving_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "moving_info" DROP COLUMN "moving_date",
ADD COLUMN     "moving_date" TIMESTAMP(3) NOT NULL;
