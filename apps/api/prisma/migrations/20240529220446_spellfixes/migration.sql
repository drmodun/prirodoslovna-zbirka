/*
  Warnings:

  - The values [ORGANISAITON_APPROVAL] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('POST_APPROVAL', 'EXPONAT_APPROVAL', 'MEMBERSHIP_REQUEST', 'MEMBERSHIP_CHANGE', 'NEW_FOLLOWER', 'POST_BY_FOLLOWED_ACCOUNT', 'EXPONAT_BY_FOLLOWED_ORGANISATION', 'WORK_BY_FOLLOWED_ORGANISATION', 'ORGANISATION_APPROVAL', 'NEW_SOCIAL_POST', 'POINT_MILESTONE', 'OTHER');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;
