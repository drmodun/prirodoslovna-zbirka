-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ORGANISAITON_APPROVAL';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "IsEmailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
