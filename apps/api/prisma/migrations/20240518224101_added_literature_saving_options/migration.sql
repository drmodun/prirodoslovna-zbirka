-- AlterTable
ALTER TABLE "Categorization" ADD COLUMN     "speciesKey" TEXT,
ALTER COLUMN "genus" DROP NOT NULL,
ALTER COLUMN "kingdom" DROP NOT NULL,
ALTER COLUMN "domain" DROP NOT NULL,
ALTER COLUMN "phylum" DROP NOT NULL,
ALTER COLUMN "class" DROP NOT NULL,
ALTER COLUMN "order" DROP NOT NULL,
ALTER COLUMN "family" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SavedLiterature" (
    "userId" TEXT NOT NULL,
    "literatureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedLiterature_pkey" PRIMARY KEY ("literatureId","userId")
);

-- AddForeignKey
ALTER TABLE "SavedLiterature" ADD CONSTRAINT "SavedLiterature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
