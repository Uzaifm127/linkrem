/*
  Warnings:

  - You are about to drop the column `title` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the `_LinkToTag` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_LinkToTag" DROP CONSTRAINT "_LinkToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_LinkToTag" DROP CONSTRAINT "_LinkToTag_B_fkey";

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "_LinkToTag";

-- CreateTable
CREATE TABLE "_LinkTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LinkTag_AB_unique" ON "_LinkTag"("A", "B");

-- CreateIndex
CREATE INDEX "_LinkTag_B_index" ON "_LinkTag"("B");

-- AddForeignKey
ALTER TABLE "_LinkTag" ADD CONSTRAINT "_LinkTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LinkTag" ADD CONSTRAINT "_LinkTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
