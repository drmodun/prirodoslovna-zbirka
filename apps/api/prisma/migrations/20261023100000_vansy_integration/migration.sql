-- CreateTable
CREATE TABLE "VansyWebhookEvent" (
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VansyWebhookEvent_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "VansyAttemptResult" (
    "attemptId" TEXT NOT NULL,
    "vansyQuizId" TEXT NOT NULL,
    "organisationId" TEXT,
    "userId" TEXT,
    "status" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN,
    "durationMs" INTEGER NOT NULL,
    "reviewStatus" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VansyAttemptResult_pkey" PRIMARY KEY ("attemptId")
);

-- CreateIndex
CREATE INDEX "VansyAttemptResult_userId_idx" ON "VansyAttemptResult"("userId");

-- CreateIndex
CREATE INDEX "VansyAttemptResult_vansyQuizId_idx" ON "VansyAttemptResult"("vansyQuizId");

-- AddForeignKey
ALTER TABLE "VansyAttemptResult" ADD CONSTRAINT "VansyAttemptResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

