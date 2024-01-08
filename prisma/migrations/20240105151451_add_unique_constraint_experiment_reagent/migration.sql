/*
  Warnings:

  - A unique constraint covering the columns `[experimentId,reagentId]` on the table `ExperimentReagent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExperimentReagent_experimentId_reagentId_key" ON "ExperimentReagent"("experimentId", "reagentId");
