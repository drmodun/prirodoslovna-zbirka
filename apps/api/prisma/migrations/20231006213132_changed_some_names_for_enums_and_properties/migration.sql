/*
  Warnings:

  - The values [MECKO_MOSLAVACKA] on the enum `County` will be removed. If these variants are still used in the database, this will fail.
  - The values [OWNER,TEACHER,GUEST] on the enum `MemberRole` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `UserFollows` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `followingId` on the `UserFollows` table. All the data in the column will be lost.
  - Added the required column `followeeId` to the `UserFollows` table without a default value. This is not possible if the table is not empty.

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
BEGIN;
CREATE TYPE "MemberRole_new" AS ENUM ('ADMIN', 'MEMBER');
ALTER TABLE "OrganisationUser" ALTER COLUMN "role" TYPE "MemberRole_new" USING ("role"::text::"MemberRole_new");
ALTER TYPE "MemberRole" RENAME TO "MemberRole_old";
ALTER TYPE "MemberRole_new" RENAME TO "MemberRole";
DROP TYPE "MemberRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "UserFollows" DROP CONSTRAINT "UserFollows_followingId_fkey";

-- AlterTable
ALTER TABLE "UserFollows" DROP CONSTRAINT "UserFollows_pkey",
DROP COLUMN "followingId",
ADD COLUMN     "followeeId" TEXT NOT NULL,
ADD CONSTRAINT "UserFollows_pkey" PRIMARY KEY ("followerId", "followeeId");

-- AddForeignKey
ALTER TABLE "UserFollows" ADD CONSTRAINT "UserFollows_followeeId_fkey" FOREIGN KEY ("followeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
