-- CreateTable
CREATE TABLE "SavedWorks" (
    "userId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,

    CONSTRAINT "SavedWorks_pkey" PRIMARY KEY ("workId","userId")
);

-- AddForeignKey
ALTER TABLE "SavedWorks" ADD CONSTRAINT "SavedWorks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedWorks" ADD CONSTRAINT "SavedWorks_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
