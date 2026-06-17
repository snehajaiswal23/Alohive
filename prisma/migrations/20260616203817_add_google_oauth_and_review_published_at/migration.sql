-- AlterTable
ALTER TABLE "GoogleReview" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "GoogleOAuthConfig" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT,
    "locationId" TEXT,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleOAuthConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleOAuthConfig_businessId_key" ON "GoogleOAuthConfig"("businessId");

-- AddForeignKey
ALTER TABLE "GoogleOAuthConfig" ADD CONSTRAINT "GoogleOAuthConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
