/*
  Warnings:

  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('POST_APPROVAL', 'EXPONAT_APPROVAL', 'MEMBERSHIP_REQUEST', 'MEMBERSHIP_CHANGE', 'NEW_FOLLOWER', 'POST_BY_FOLLOWED_ACCOUNT', 'EXPONAT_BY_FOLLOWED_ORGANISATION', 'WORK_BY_FOLLOWED_ORGANISATION', 'NEW_SOCIAL_POST', 'POINT_MILESTONE', 'OTHER');

-- AlterTable
ALTER TABLE "Exponat" ADD COLUMN     "IsNotificationMade" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "IsNotificationMade" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "IsNotificationMade" BOOLEAN NOT NULL DEFAULT false;
