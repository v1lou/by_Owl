/*
  Warnings:

  - You are about to drop the `FavoriteGenre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FavoriteMovie` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FavoriteMovie" DROP CONSTRAINT "FavoriteMovie_genreId_fkey";

-- AlterTable
ALTER TABLE "Genre" ALTER COLUMN "color" SET DEFAULT '#1a1a2e';

-- DropTable
DROP TABLE "FavoriteGenre";

-- DropTable
DROP TABLE "FavoriteMovie";
