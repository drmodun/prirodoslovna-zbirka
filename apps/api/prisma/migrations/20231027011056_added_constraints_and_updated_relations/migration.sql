/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Organisation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Exponat" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_email_key" ON "Organisation"("email");
