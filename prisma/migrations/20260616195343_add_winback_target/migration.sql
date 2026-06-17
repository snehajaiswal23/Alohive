-- CreateTable
CREATE TABLE "WinBackTarget" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "bucket" INTEGER NOT NULL,
    "daysInactive" INTEGER NOT NULL,
    "lastVisitAt" TIMESTAMP(3) NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactedAt" TIMESTAMP(3),

    CONSTRAINT "WinBackTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WinBackTarget_customerId_key" ON "WinBackTarget"("customerId");

-- CreateIndex
CREATE INDEX "WinBackTarget_businessId_bucket_idx" ON "WinBackTarget"("businessId", "bucket");

-- AddForeignKey
ALTER TABLE "WinBackTarget" ADD CONSTRAINT "WinBackTarget_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WinBackTarget" ADD CONSTRAINT "WinBackTarget_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
