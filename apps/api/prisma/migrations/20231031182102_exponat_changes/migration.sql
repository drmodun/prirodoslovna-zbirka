-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "ExponatId" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_ExponatId_fkey" FOREIGN KEY ("ExponatId") REFERENCES "Exponat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
