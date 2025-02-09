/*
  Warnings:

  - You are about to drop the column `selected` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `isAvailable` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "selected",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL;
