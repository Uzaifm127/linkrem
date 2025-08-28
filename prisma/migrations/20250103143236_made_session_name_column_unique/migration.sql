/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SessionLinks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SessionLinks_name_key" ON "SessionLinks"("name");
