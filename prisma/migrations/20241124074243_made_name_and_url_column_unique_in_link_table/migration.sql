/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Link` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `Link` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Link_name_key" ON "Link"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Link_url_key" ON "Link"("url");
