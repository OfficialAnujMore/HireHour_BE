/*
  Warnings:

  - You are about to drop the column `imageUri` on the `ServicePreview` table. All the data in the column will be lost.
  - Added the required column `uri` to the `ServicePreview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServicePreview" DROP COLUMN "imageUri",
ADD COLUMN     "uri" TEXT NOT NULL;
