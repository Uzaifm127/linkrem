/*
  Warnings:

  - You are about to drop the `LinkTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LinkTag" DROP CONSTRAINT "LinkTag_linkId_fkey";

-- DropForeignKey
ALTER TABLE "LinkTag" DROP CONSTRAINT "LinkTag_tagId_fkey";

-- DropTable
DROP TABLE "LinkTag";
