/*
  Warnings:

  - You are about to drop the column `otherImages` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `SocialPost` table. All the data in the column will be lost.
  - Added the required column `image` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `SocialPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailImage` to the `SocialPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "otherImages";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "images",
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SocialPost" DROP COLUMN "images",
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "thumbnailImage" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT NOT NULL;
