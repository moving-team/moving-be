/*
  Warnings:

  - Changed the type of `moving_type` on the `moving_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "moving_info" DROP COLUMN "moving_type",
ADD COLUMN     "moving_type" "serviceType" NOT NULL;
