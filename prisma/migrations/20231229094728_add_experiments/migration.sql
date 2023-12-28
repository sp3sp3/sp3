-- CreateTable
CREATE TABLE "Experiment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "parentId" INTEGER NOT NULL,
    CONSTRAINT "Experiment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
