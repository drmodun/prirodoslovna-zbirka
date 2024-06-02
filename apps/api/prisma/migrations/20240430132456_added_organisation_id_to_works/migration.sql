/*
  Warnings:

  - Added the required column `document` to the `Work` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organisationId` to the `Work` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "document" TEXT NOT NULL,
ADD COLUMN     "firstPublished" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organisationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
