/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Language` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Language` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Language_name_key";

-- AlterTable
ALTER TABLE "Language" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Language_slug_key" ON "Language"("slug");
