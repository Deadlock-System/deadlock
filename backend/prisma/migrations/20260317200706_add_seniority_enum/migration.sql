/*
  Warnings:

  - The `seniority_id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Seniority" AS ENUM ('NOT_SELECTED', 'STUDENDT', 'JUNIOR', 'PLENO', 'SENIOR', 'TECH_LEAD', 'C_LEVEL');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "seniority_id",
ADD COLUMN     "seniority_id" "Seniority" NOT NULL DEFAULT 'NOT_SELECTED';
