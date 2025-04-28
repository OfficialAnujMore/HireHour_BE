-- AlterTable
ALTER TABLE "schedule" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "url" TEXT,
ADD COLUMN     "venue" TEXT NOT NULL DEFAULT '';
