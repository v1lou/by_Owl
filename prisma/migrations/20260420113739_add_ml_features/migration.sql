-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Visitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "firstVisit" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisit" DATETIME NOT NULL,
    "clicks" TEXT NOT NULL DEFAULT '{}',
    "sections" TEXT NOT NULL DEFAULT '{}',
    "character" TEXT NOT NULL DEFAULT 'new',
    "visitGaps" TEXT NOT NULL DEFAULT '[]',
    "hourPattern" TEXT NOT NULL DEFAULT '{}',
    "sessionDepth" REAL NOT NULL DEFAULT 0,
    "clickRatio" REAL NOT NULL DEFAULT 0,
    "persona" TEXT NOT NULL DEFAULT 'explorer'
);
INSERT INTO "new_Visitor" ("character", "clicks", "firstVisit", "id", "lastVisit", "sections", "visits") SELECT "character", "clicks", "firstVisit", "id", "lastVisit", "sections", "visits" FROM "Visitor";
DROP TABLE "Visitor";
ALTER TABLE "new_Visitor" RENAME TO "Visitor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
