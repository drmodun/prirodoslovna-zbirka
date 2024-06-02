/*
  Warnings:

  - You are about to drop the column `serialNumeber` on the `Exponat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serialNumber]` on the table `Exponat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Exponat_serialNumeber_key";

-- AlterTable
ALTER TABLE "Exponat" DROP COLUMN "serialNumeber",
ADD COLUMN     "serialNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Exponat_serialNumber_key" ON "Exponat"("serialNumber");
