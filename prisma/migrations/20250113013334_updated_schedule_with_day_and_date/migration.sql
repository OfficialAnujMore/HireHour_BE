-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "day" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "fullDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "month" TEXT NOT NULL DEFAULT 'Unknown';

-- AlterTable
ALTER TABLE "TimeSlot" ALTER COLUMN "available" DROP DEFAULT;
