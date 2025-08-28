/*
  Warnings:

  - A unique constraint covering the columns `[linkId]` on the table `Shortcut` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shortcutKey,linkId]` on the table `Shortcut` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `linkId` to the `Shortcut` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shortcut" ADD COLUMN     "linkId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Shortcut_linkId_key" ON "Shortcut"("linkId");

-- CreateIndex
CREATE UNIQUE INDEX "Shortcut_shortcutKey_linkId_key" ON "Shortcut"("shortcutKey", "linkId");

-- AddForeignKey
ALTER TABLE "Shortcut" ADD CONSTRAINT "Shortcut_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
