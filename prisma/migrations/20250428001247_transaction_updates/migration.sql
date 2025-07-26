/*
  Warnings:

  - You are about to drop the column `amount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "amount",
DROP COLUMN "status",
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tax" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0.0;
