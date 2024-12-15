/*
  Warnings:

  - Added the required column `estimate_request_id` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "estimate_request_id" INTEGER NOT NULL,
ALTER COLUMN "estimate_id" DROP NOT NULL,
ALTER COLUMN "assigned_estimate_request_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_estimate_request_id_fkey" FOREIGN KEY ("estimate_request_id") REFERENCES "estimate_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
