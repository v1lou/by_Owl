/*
  Warnings:

  - You are about to drop the column `color` on the `Genre` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cosplay" ADD COLUMN     "coverPhoto" TEXT;

-- AlterTable
ALTER TABLE "Genre" DROP COLUMN "color",
ADD COLUMN     "coverUrl" TEXT;

-- AlterTable
ALTER TABLE "GenreItem" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
