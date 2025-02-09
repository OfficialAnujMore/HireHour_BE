/*
  Warnings:

  - You are about to drop the column `day` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `fullDate` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `selected` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_scheduleId_fkey";

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "day",
DROP COLUMN "fullDate",
DROP COLUMN "month",
ADD COLUMN     "selected" BOOLEAN NOT NULL;
