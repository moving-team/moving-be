/*
  Warnings:

  - You are about to drop the column `rejection_reason` on the `assigned_estimate_request` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "serviceRegion" ADD VALUE 'NULL';

-- AlterTable
ALTER TABLE "assigned_estimate_request" DROP COLUMN "rejection_reason";

-- AlterTable
ALTER TABLE "mover" ALTER COLUMN "nickname" DROP NOT NULL;
