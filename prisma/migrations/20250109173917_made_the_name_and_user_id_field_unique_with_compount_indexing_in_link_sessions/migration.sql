/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `LinkSessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LinkSessions_name_userId_key" ON "LinkSessions"("name", "userId");
