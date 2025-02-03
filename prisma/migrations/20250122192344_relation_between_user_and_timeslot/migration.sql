-- AlterTable
ALTER TABLE "Services" ALTER COLUMN "ratings" SET DEFAULT '5.0';

-- AlterTable
ALTER TABLE "TimeSlot" ADD COLUMN     "bookedUserId" TEXT;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_bookedUserId_fkey" FOREIGN KEY ("bookedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
