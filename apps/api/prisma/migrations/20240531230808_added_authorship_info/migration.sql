-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "isApproved" SET DEFAULT false;

-- CreateTable
CREATE TABLE "AuthorshipInfo" (
    "locationOfOccurence" TEXT NOT NULL,
    "dateOfOccurence" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT,
    "nonPlatformAuthor" TEXT,
    "identifiedBy" TEXT,
    "deviceName" TEXT,
    "photographer" TEXT,
    "literature" TEXT[],
    "id" TEXT NOT NULL,

    CONSTRAINT "AuthorshipInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuthorshipInfo" ADD CONSTRAINT "AuthorshipInfo_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
