-- AlterTable
ALTER TABLE "FavoriteMovie" ADD COLUMN     "posterUrl" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'movie';

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenreItem" (
    "id" SERIAL NOT NULL,
    "genreId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'movie',
    "streamLink" TEXT NOT NULL,
    "description" TEXT,
    "posterUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenreItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GenreItem" ADD CONSTRAINT "GenreItem_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
