-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WorkType" ADD VALUE 'CONFERENCE_PROCEEDINGS';
ALTER TYPE "WorkType" ADD VALUE 'WORKING_PAPER';
ALTER TYPE "WorkType" ADD VALUE 'REPORT';
ALTER TYPE "WorkType" ADD VALUE 'PATENT';
ALTER TYPE "WorkType" ADD VALUE 'NEWSPAPER_ARTICLE';
ALTER TYPE "WorkType" ADD VALUE 'COMPUTER_PROGRAM';
ALTER TYPE "WorkType" ADD VALUE 'HEARING';
ALTER TYPE "WorkType" ADD VALUE 'TELEVISION_BROADCAST';
ALTER TYPE "WorkType" ADD VALUE 'FILM';
ALTER TYPE "WorkType" ADD VALUE 'BILL';
