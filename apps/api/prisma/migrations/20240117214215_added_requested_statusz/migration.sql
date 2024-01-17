-- AlterEnum
ALTER TYPE "MemberRole" ADD VALUE 'REQUESTED';

-- AlterTable
ALTER TABLE "OrganisationUser" ALTER COLUMN "role" SET DEFAULT 'REQUESTED';
