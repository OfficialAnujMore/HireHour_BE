-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
