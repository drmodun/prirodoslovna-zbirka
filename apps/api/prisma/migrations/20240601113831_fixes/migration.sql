/*
  Warnings:

  - The values [NEW_EXPONAT_REQUEST,NEW_POST_REQUEST,NEW_WORK_REQUEST] on the enum `County` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "County_new" AS ENUM ('SPLITSKO_DALMATINSKA', 'DUBROVACKO_NERETVANSKA', 'SIBENSKO_KNINSKA', 'ZADARSKA', 'ZAGREBACKA', 'KARLOVACKA', 'VARAZDINSKA', 'KOPRIVNICKO_KRIZEVACKA', 'KRAPINSKO_ZAGORSKA', 'MEDIMURSKA', 'OSIJECKO_BARANJSKA', 'POZESKO_SLAVONSKA', 'PRIMORSKO_GORANSKA', 'SISACKO_MOSLAVACKA', 'VUKOVARSKO_SRIJEMSKA', 'GRAD_ZAGREB', 'BJELOVARSKO_BILOGORSKA', 'BRODSKO_POSAVSKA', 'ISTARSKA', 'LICKO_SENJSKA', 'VIROVITICKO_PODRAVSKA', 'OTHER');
ALTER TABLE "User" ALTER COLUMN "location" TYPE "County_new" USING ("location"::text::"County_new");
ALTER TABLE "Organisation" ALTER COLUMN "location" TYPE "County_new" USING ("location"::text::"County_new");
ALTER TYPE "County" RENAME TO "County_old";
ALTER TYPE "County_new" RENAME TO "County";
DROP TYPE "County_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'NEW_EXPONAT_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'NEW_POST_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'NEW_WORK_REQUEST';
