-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HomeSection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "alignment" TEXT NOT NULL DEFAULT 'left'
);
INSERT INTO "new_HomeSection" ("content", "id", "image", "link", "order", "title") SELECT "content", "id", "image", "link", "order", "title" FROM "HomeSection";
DROP TABLE "HomeSection";
ALTER TABLE "new_HomeSection" RENAME TO "HomeSection";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
