-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stream" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "hasVod" BOOLEAN NOT NULL DEFAULT false,
    "vodUrl" TEXT,
    "link" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "isPast" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Stream" ("createdAt", "date", "game", "id", "isLive", "isPast", "link", "title", "updatedAt") SELECT "createdAt", "date", "game", "id", "isLive", "isPast", "link", "title", "updatedAt" FROM "Stream";
DROP TABLE "Stream";
ALTER TABLE "new_Stream" RENAME TO "Stream";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
