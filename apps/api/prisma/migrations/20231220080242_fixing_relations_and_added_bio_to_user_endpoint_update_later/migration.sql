-- DropForeignKey
ALTER TABLE "Exponat" DROP CONSTRAINT "Exponat_categorizationId_fkey";

-- DropForeignKey
ALTER TABLE "Exponat" DROP CONSTRAINT "Exponat_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_ExponatId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT NOT NULL DEFAULT 'Homo sapiens u biosferi';

-- AddForeignKey
ALTER TABLE "Exponat" ADD CONSTRAINT "Exponat_categorizationId_fkey" FOREIGN KEY ("categorizationId") REFERENCES "Categorization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exponat" ADD CONSTRAINT "Exponat_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_ExponatId_fkey" FOREIGN KEY ("ExponatId") REFERENCES "Exponat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
