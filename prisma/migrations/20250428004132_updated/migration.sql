/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransactionItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `TransactionSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `servicePreview` table without a default value. This is not possible if the table is not empty.
  - Made the column `token` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `refreshToken` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TransactionItem" DROP CONSTRAINT "TransactionItem_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionSchedule" DROP CONSTRAINT "TransactionSchedule_transactionItemId_fkey";

-- AlterTable
ALTER TABLE "TransactionSchedule" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "schedule" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "servicePreview" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "token" SET NOT NULL,
ALTER COLUMN "refreshToken" SET NOT NULL;

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "TransactionItem";

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "tax" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactionItem" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceTitle" TEXT NOT NULL,
    "servicePrice" DECIMAL(65,30) NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "meetingUrl" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "state" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactionItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactionItem" ADD CONSTRAINT "transactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionSchedule" ADD CONSTRAINT "TransactionSchedule_transactionItemId_fkey" FOREIGN KEY ("transactionItemId") REFERENCES "transactionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
