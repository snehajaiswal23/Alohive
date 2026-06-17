-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "referralCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_referralCode_key" ON "Customer"("referralCode");
