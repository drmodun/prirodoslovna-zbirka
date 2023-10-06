/*
  Warnings:

  - You are about to drop the column `latinName` on the `Exponat` table. All the data in the column will be lost.
  - You are about to drop the `FavouriteMinerals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mineral` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ExponatKind` to the `Exponat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alternateName` to the `Exponat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExponatKind" AS ENUM ('PROCARIOT', 'EUCARIOT', 'MINERAL');

-- DropForeignKey
ALTER TABLE "Exponat" DROP CONSTRAINT "Exponat_categorizationId_fkey";

-- DropForeignKey
ALTER TABLE "FavouriteMinerals" DROP CONSTRAINT "FavouriteMinerals_mineralId_fkey";

-- DropForeignKey
ALTER TABLE "FavouriteMinerals" DROP CONSTRAINT "FavouriteMinerals_userId_fkey";

-- DropForeignKey
ALTER TABLE "Mineral" DROP CONSTRAINT "Mineral_organisationId_fkey";

-- AlterTable
ALTER TABLE "Exponat" DROP COLUMN "latinName",
ADD COLUMN     "ExponatKind" "ExponatKind" NOT NULL,
ADD COLUMN     "alternateName" TEXT NOT NULL,
ALTER COLUMN "categorizationId" DROP NOT NULL;

-- DropTable
DROP TABLE "FavouriteMinerals";

-- DropTable
DROP TABLE "Mineral";

-- AddForeignKey
ALTER TABLE "Exponat" ADD CONSTRAINT "Exponat_categorizationId_fkey" FOREIGN KEY ("categorizationId") REFERENCES "Categorization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
