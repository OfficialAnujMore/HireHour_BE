/*
  Warnings:

  - The `userRole` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `category` to the `Services` table without a default value. This is not possible if the table is not empty.
  - Made the column `isDeleted` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDisabled` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Services" ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userRole",
ADD COLUMN     "userRole" TEXT NOT NULL DEFAULT 'CUSTOMER',
ALTER COLUMN "isDeleted" SET NOT NULL,
ALTER COLUMN "isDisabled" SET NOT NULL;

-- CreateIndex
CREATE INDEX "User_id_email_username_idx" ON "User"("id", "email", "username");
