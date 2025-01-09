/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `Link` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Link_name_userId_key" ON "Link"("name", "userId");
