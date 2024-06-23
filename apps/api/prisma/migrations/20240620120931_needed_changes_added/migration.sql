/*
  Warnings:

  - The `correct` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "image" TEXT,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "correct",
ADD COLUMN     "correct" TEXT[];

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false;
