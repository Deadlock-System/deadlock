/*
  Warnings:

  - You are about to drop the column `conteudo` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `data_criacao` on the `Comment` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the `Languages_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Snippet` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Language` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Languages_posts" DROP CONSTRAINT "Languages_posts_language_id_fkey";

-- DropForeignKey
ALTER TABLE "Languages_posts" DROP CONSTRAINT "Languages_posts_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Snippet" DROP CONSTRAINT "Snippet_language_id_fkey";

-- DropForeignKey
ALTER TABLE "Snippet" DROP CONSTRAINT "Snippet_post_id_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "conteudo",
DROP COLUMN "data_criacao",
ADD COLUMN     "content" VARCHAR(10000) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "content" VARCHAR(20000) NOT NULL,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- DropTable
DROP TABLE "Languages_posts";

-- DropTable
DROP TABLE "Snippet";

-- CreateTable
CREATE TABLE "_LanguageToPost" (
    "A" SMALLINT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LanguageToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LanguageToPost_B_index" ON "_LanguageToPost"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- AddForeignKey
ALTER TABLE "_LanguageToPost" ADD CONSTRAINT "_LanguageToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LanguageToPost" ADD CONSTRAINT "_LanguageToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
