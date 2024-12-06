-- CreateEnum
CREATE TYPE "userType" AS ENUM ('CUSTOMER', 'MOVER');

-- CreateEnum
CREATE TYPE "serviceRegion" AS ENUM ('SEOUL', 'GYEONGGI', 'INCHEON', 'GANGWON', 'CHUNGBUK', 'CHUNGNAM', 'SEJONG', 'DAEJEON', 'JEONBUK', 'JEONNAM', 'GWANGJU', 'GYEONGBUK', 'GYEONGNAM', 'DAEGU', 'ULSAN', 'BUSAN', 'JEJU');

-- CreateEnum
CREATE TYPE "serviceType" AS ENUM ('SMALL', 'HOUSE', 'OFFICE');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('WAITING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "user_type" "userType" NOT NULL,
    "name" VARCHAR(10) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password" VARCHAR(60),
    "provider" TEXT,
    "provider_id" TEXT,
    "phone_number" VARCHAR(11) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mover" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "profile_image" TEXT,
    "nickname" VARCHAR(10) NOT NULL,
    "career" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "service_region" "serviceRegion"[],
    "service_type" "serviceType"[],
    "confirmation_count" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "profile_image" TEXT,
    "service_type" "serviceType"[],
    "region" "serviceRegion" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" SERIAL NOT NULL,
    "estimate_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "mover_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moving_info" (
    "id" SERIAL NOT NULL,
    "moving_type" INTEGER NOT NULL,
    "moving_date" TEXT NOT NULL,
    "departure" TEXT NOT NULL,
    "arrival" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moving_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_requests" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "moving_info_id" INTEGER NOT NULL,
    "comment" TEXT,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "is_cancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimate_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assigned_estimate_request" (
    "id" SERIAL NOT NULL,
    "estimate_requests_id" INTEGER NOT NULL,
    "mover_id" INTEGER NOT NULL,
    "is_rejected" BOOLEAN NOT NULL DEFAULT false,
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assigned_estimate_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "mover_id" INTEGER NOT NULL,
    "estimate_requests_id" INTEGER NOT NULL,
    "moving_info_id" INTEGER NOT NULL,
    "is_moving_complete" BOOLEAN NOT NULL DEFAULT false,
    "status" "status" NOT NULL DEFAULT 'WAITING',
    "is_assigned" BOOLEAN NOT NULL DEFAULT false,
    "price" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "mover_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "estimate_id" INTEGER NOT NULL,
    "assigned_estimate_request_id" INTEGER NOT NULL,
    "contents" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mover_user_id_key" ON "mover"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mover_nickname_key" ON "mover"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "customer_user_id_key" ON "customer"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_estimate_id_key" ON "review"("estimate_id");

-- AddForeignKey
ALTER TABLE "mover" ADD CONSTRAINT "mover_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_requests" ADD CONSTRAINT "estimate_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_requests" ADD CONSTRAINT "estimate_requests_moving_info_id_fkey" FOREIGN KEY ("moving_info_id") REFERENCES "moving_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_estimate_request" ADD CONSTRAINT "assigned_estimate_request_estimate_requests_id_fkey" FOREIGN KEY ("estimate_requests_id") REFERENCES "estimate_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_estimate_request" ADD CONSTRAINT "assigned_estimate_request_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate" ADD CONSTRAINT "estimate_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate" ADD CONSTRAINT "estimate_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate" ADD CONSTRAINT "estimate_estimate_requests_id_fkey" FOREIGN KEY ("estimate_requests_id") REFERENCES "estimate_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate" ADD CONSTRAINT "estimate_moving_info_id_fkey" FOREIGN KEY ("moving_info_id") REFERENCES "moving_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_mover_id_fkey" FOREIGN KEY ("mover_id") REFERENCES "mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_assigned_estimate_request_id_fkey" FOREIGN KEY ("assigned_estimate_request_id") REFERENCES "assigned_estimate_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;