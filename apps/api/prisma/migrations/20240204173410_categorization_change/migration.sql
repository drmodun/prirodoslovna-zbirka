/*
  Warnings:

  - A unique constraint covering the columns `[species]` on the table `Categorization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `species` to the `Categorization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Categorization" ADD COLUMN     "species" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Categorization_species_key" ON "Categorization"("species");
