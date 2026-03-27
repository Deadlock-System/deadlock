-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('GITHUB', 'GOOGLE');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "hashed_password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "UserProvider" (
    "id" TEXT NOT NULL,
    "provider" "ProviderType" NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProvider_provider_providerId_key" ON "UserProvider"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProvider_userId_provider_key" ON "UserProvider"("userId", "provider");

-- AddForeignKey
ALTER TABLE "UserProvider" ADD CONSTRAINT "UserProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
