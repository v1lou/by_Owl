-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "firstVisit" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisit" DATETIME NOT NULL,
    "clicks" TEXT NOT NULL DEFAULT '{}',
    "sections" TEXT NOT NULL DEFAULT '{}',
    "character" TEXT NOT NULL DEFAULT 'new'
);

-- CreateIndex
CREATE INDEX "Visitor_character_idx" ON "Visitor"("character");

-- CreateIndex
CREATE INDEX "Visitor_lastVisit_idx" ON "Visitor"("lastVisit");
