-- AlterTable
ALTER TABLE "GoogleReview" ADD COLUMN     "customerId" TEXT;

-- AddForeignKey
ALTER TABLE "GoogleReview" ADD CONSTRAINT "GoogleReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
