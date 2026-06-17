-- AlterTable
ALTER TABLE "WhatsappMessage" ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "gupshupMessageId" TEXT,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "repliedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "WhatsappMessage_gupshupMessageId_idx" ON "WhatsappMessage"("gupshupMessageId");

-- AddForeignKey
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
