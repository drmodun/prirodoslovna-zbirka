/*
  Warnings:

  - You are about to drop the column `authorId` on the `SocialPost` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `SocialPost` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authorshipInfoId]` on the table `Exponat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[authorshipInfoId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[authorshipInfoId]` on the table `SocialPost` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organisationId` to the `SocialPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SocialPostType" AS ENUM ('STORY', 'EU_PROJECT', 'NEWS', 'EVENT', 'ANNOUNCEMENT', 'WORKSHOP', 'OTHER', 'GUIDE');

-- DropForeignKey
ALTER TABLE "SocialPost" DROP CONSTRAINT "SocialPost_authorId_fkey";

-- DropIndex
DROP INDEX "SocialPost_authorId_key";

-- AlterTable
ALTER TABLE "AuthorshipInfo" ADD COLUMN     "postId" TEXT,
ALTER COLUMN "locationOfOccurence" DROP NOT NULL,
ALTER COLUMN "dateOfOccurence" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Exponat" ADD COLUMN     "authorshipInfoId" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "authorshipInfoId" TEXT;

-- AlterTable
ALTER TABLE "SocialPost" DROP COLUMN "authorId",
DROP COLUMN "image",
ADD COLUMN     "authorshipInfoId" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "organisationId" TEXT NOT NULL,
ADD COLUMN     "type" "SocialPostType" NOT NULL DEFAULT 'NEWS';

-- CreateIndex
CREATE UNIQUE INDEX "Exponat_authorshipInfoId_key" ON "Exponat"("authorshipInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_authorshipInfoId_key" ON "Post"("authorshipInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialPost_authorshipInfoId_key" ON "SocialPost"("authorshipInfoId");

-- AddForeignKey
ALTER TABLE "Exponat" ADD CONSTRAINT "Exponat_authorshipInfoId_fkey" FOREIGN KEY ("authorshipInfoId") REFERENCES "AuthorshipInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorshipInfoId_fkey" FOREIGN KEY ("authorshipInfoId") REFERENCES "AuthorshipInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_authorshipInfoId_fkey" FOREIGN KEY ("authorshipInfoId") REFERENCES "AuthorshipInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
