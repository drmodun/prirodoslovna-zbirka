-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "isCorrect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "maxScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ALTER COLUMN "timeTaken" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Attempt_quizId_userId_idx" ON "Attempt"("quizId", "userId");
