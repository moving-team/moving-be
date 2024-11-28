/*
  Warnings:

  - A unique constraint covering the columns `[estimate_id]` on the table `review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `estimate_id` to the `review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "review" ADD COLUMN     "estimate_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "review_estimate_id_key" ON "review"("estimate_id");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
