/*
  Warnings:

  - A unique constraint covering the columns `[moving_info_id]` on the table `estimate_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "estimate_requests_moving_info_id_key" ON "estimate_requests"("moving_info_id");
