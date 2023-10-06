/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `code` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'TEACHER', 'MEMBER', 'GUEST');

-- CreateEnum
CREATE TYPE "County" AS ENUM ('SPLITSKO_DALMATINSKA', 'DUBROVACKO_NERETVANSKA', 'SIBENSKO_KNINSKA', 'ZADARSKA', 'ZAGREBACKA', 'KARLOVACKA', 'VARAZDINSKA', 'KOPRIVNICKO_KRIZEVACKA', 'KRAPINSKO_ZAGORSKA', 'MEDIMURSKA', 'OSIJECKO_BARANJSKA', 'POZESKO_SLAVONSKA', 'PRIMORSKO_GORANSKA', 'SISACKO_MOSLAVACKA', 'VUKOVARSKO_SRIJEMSKA', 'GRAD_ZAGREB', 'BJELOVARSKO_BILOGORSKA', 'BRODSKO_POSAVSKA', 'ISTARSKA', 'LICKO_SENJSKA', 'MECKO_MOSLAVACKA', 'VIROVITICKO_PODRAVSKA', 'OTHER');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "name",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "location" "County" NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "Categorization" (
    "id" TEXT NOT NULL,
    "genus" TEXT NOT NULL,
    "kingdom" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "phylum" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "order" TEXT NOT NULL,
    "family" TEXT NOT NULL,

    CONSTRAINT "Categorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Species" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latinName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "funFacts" TEXT[],
    "attributes" JSONB NOT NULL,
    "mainImage" TEXT NOT NULL,
    "categorizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organisationId" TEXT,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "mainImage" TEXT NOT NULL,
    "otherImages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" "County" NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mineral" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mainImage" TEXT NOT NULL,
    "otherImages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "greekName" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organisationId" TEXT,

    CONSTRAINT "Mineral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationUser" (
    "role" "MemberRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organisationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OrganisationUser_pkey" PRIMARY KEY ("organisationId","userId")
);

-- CreateTable
CREATE TABLE "Likes" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("postId","userId")
);

-- CreateTable
CREATE TABLE "FavouriteSpecies" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "speciesId" TEXT NOT NULL,

    CONSTRAINT "FavouriteSpecies_pkey" PRIMARY KEY ("speciesId","userId")
);

-- CreateTable
CREATE TABLE "FavouriteMinerals" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "mineralId" TEXT NOT NULL,

    CONSTRAINT "FavouriteMinerals_pkey" PRIMARY KEY ("mineralId","userId")
);

-- CreateTable
CREATE TABLE "UserOrganisationFollower" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,

    CONSTRAINT "UserOrganisationFollower_pkey" PRIMARY KEY ("organisationId","userId")
);

-- CreateTable
CREATE TABLE "UserFollows" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,

    CONSTRAINT "UserFollows_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Species_categorizationId_key" ON "Species"("categorizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Posts_authorId_key" ON "Posts"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialPost_authorId_key" ON "SocialPost"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Likes_userId_key" ON "Likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteSpecies_userId_key" ON "FavouriteSpecies"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteMinerals_userId_key" ON "FavouriteMinerals"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOrganisationFollower_userId_key" ON "UserOrganisationFollower"("userId");

-- AddForeignKey
ALTER TABLE "Species" ADD CONSTRAINT "Species_categorizationId_fkey" FOREIGN KEY ("categorizationId") REFERENCES "Categorization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Species" ADD CONSTRAINT "Species_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mineral" ADD CONSTRAINT "Mineral_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationUser" ADD CONSTRAINT "OrganisationUser_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationUser" ADD CONSTRAINT "OrganisationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteSpecies" ADD CONSTRAINT "FavouriteSpecies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteSpecies" ADD CONSTRAINT "FavouriteSpecies_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteMinerals" ADD CONSTRAINT "FavouriteMinerals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteMinerals" ADD CONSTRAINT "FavouriteMinerals_mineralId_fkey" FOREIGN KEY ("mineralId") REFERENCES "Mineral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganisationFollower" ADD CONSTRAINT "UserOrganisationFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganisationFollower" ADD CONSTRAINT "UserOrganisationFollower_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollows" ADD CONSTRAINT "UserFollows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollows" ADD CONSTRAINT "UserFollows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
