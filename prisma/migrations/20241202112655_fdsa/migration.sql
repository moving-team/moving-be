/*
  Warnings:

  - Made the column `nickname` on table `mover` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "mover" ALTER COLUMN "nickname" SET NOT NULL;
