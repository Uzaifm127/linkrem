/*
  Warnings:

  - You are about to drop the column `sessionLinksId` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SessionLinks` table. All the data in the column will be lost.
  - Added the required column `linkSessionId` to the `SessionLinks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `SessionLinks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_sessionLinksId_fkey";

-- DropForeignKey
ALTER TABLE "SessionLinks" DROP CONSTRAINT "SessionLinks_userId_fkey";

-- DropIndex
DROP INDEX "SessionLinks_name_key";

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "sessionLinksId";

-- AlterTable
ALTER TABLE "SessionLinks" DROP COLUMN "userId",
ADD COLUMN     "linkSessionId" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "LinkSessions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkSessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkSessions_name_key" ON "LinkSessions"("name");

-- AddForeignKey
ALTER TABLE "LinkSessions" ADD CONSTRAINT "LinkSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLinks" ADD CONSTRAINT "SessionLinks_linkSessionId_fkey" FOREIGN KEY ("linkSessionId") REFERENCES "LinkSessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
