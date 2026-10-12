/*
  Warnings:

  - Added the required column `mainImage` to the `SocialPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SocialPost" ADD COLUMN     "mainImage" TEXT NOT NULL;
