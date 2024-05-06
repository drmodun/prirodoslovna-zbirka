/*
  Warnings:

  - You are about to drop the column `image` on the `SocialPost` table. All the data in the column will be lost.
  - Added the required column `mainImage` to the `SocialPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socialPostType` to the `SocialPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SocialPostType" AS ENUM ('ANNOUNCEMENT', 'EVENT', 'NEWS', 'WORKSHOP', 'EU_PROJECT', 'PROMOTION', 'COLLABORATION', 'OTHER');

-- AlterTable
ALTER TABLE "SocialPost" DROP COLUMN "image",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "mainImage" TEXT NOT NULL,
ADD COLUMN     "socialPostType" "SocialPostType" NOT NULL;
