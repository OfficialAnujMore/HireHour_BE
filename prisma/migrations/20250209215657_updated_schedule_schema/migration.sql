-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "bookedUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_bookedUserId_fkey" FOREIGN KEY ("bookedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
