/*
  Warnings:

  - The `speciesKey` column on the `Categorization` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Categorization" DROP COLUMN "speciesKey",
ADD COLUMN     "speciesKey" INTEGER;
