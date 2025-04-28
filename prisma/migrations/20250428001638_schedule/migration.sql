/*
  Warnings:

  - You are about to drop the column `address` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "postalCode",
DROP COLUMN "state",
DROP COLUMN "url",
DROP COLUMN "venue";
