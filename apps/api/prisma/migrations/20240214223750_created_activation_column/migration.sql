-- AlterTable
ALTER TABLE "Exponat" ALTER COLUMN "isApproved" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "isApproved" SET DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActivated" BOOLEAN NOT NULL DEFAULT false;
