/*
  Warnings:

  - A unique constraint covering the columns `[activationCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_activationCode_key" ON "User"("activationCode");
