-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'HR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN';
