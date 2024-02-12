/*
  Warnings:

  - You are about to drop the column `thumbnailImage` on the `SocialPost` table. All the data in the column will be lost.
  - Added the required column `thumbnailImage` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "thumbnailImage" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SocialPost" DROP COLUMN "thumbnailImage";
