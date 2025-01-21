/*
  Warnings:

  - You are about to drop the column `imageURL` on the `ServicePreview` table. All the data in the column will be lost.
  - You are about to drop the column `bannerImageURL` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageURL` on the `User` table. All the data in the column will be lost.
  - Added the required column `imageUri` to the `ServicePreview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schedule" ALTER COLUMN "day" DROP DEFAULT,
ALTER COLUMN "fullDate" DROP DEFAULT,
ALTER COLUMN "month" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ServicePreview" DROP COLUMN "imageURL",
ADD COLUMN     "imageUri" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bannerImageURL",
DROP COLUMN "countryCode",
DROP COLUMN "name",
DROP COLUMN "profileImageURL",
ADD COLUMN     "avatarUri" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "userPreference" TEXT[];
