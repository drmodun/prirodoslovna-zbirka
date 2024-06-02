/*
  Warnings:

  - A unique constraint covering the columns `[serialNumeber]` on the table `Exponat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Exponat" ADD COLUMN     "serialNumeber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Exponat_serialNumeber_key" ON "Exponat"("serialNumeber");
