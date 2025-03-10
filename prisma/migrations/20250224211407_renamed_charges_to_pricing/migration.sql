/*
  Warnings:

  - You are about to drop the column `chargesPerHour` on the `services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "chargesPerHour",
ADD COLUMN     "pricing" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
