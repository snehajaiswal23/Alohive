-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "offer" TEXT,
ADD COLUMN     "triggerDays" INTEGER;

-- AlterTable
ALTER TABLE "WinBackTarget" ADD COLUMN     "lastCampaignBucket" INTEGER;
