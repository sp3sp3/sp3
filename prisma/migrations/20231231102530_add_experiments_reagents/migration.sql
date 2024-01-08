-- CreateEnum
CREATE TYPE "ReactionSchemeLocation" AS ENUM ('LEFT_SIDE', 'ABOVE_ARROW', 'BELOW_ARROW', 'RIGHT_SIDE');

-- CreateTable
CREATE TABLE "ExperimentReagent" (
    "id" SERIAL NOT NULL,
    "experimentId" INTEGER NOT NULL,
    "reactionSchemeLocation" "ReactionSchemeLocation" NOT NULL,
    "reagentId" INTEGER NOT NULL,
    "equivalents" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ExperimentReagent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reagent" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "canonicalSMILES" mol,

    CONSTRAINT "Reagent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reagent_name_key" ON "Reagent"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Reagent_canonicalSMILES_key" ON "Reagent"("canonicalSMILES");

-- AddForeignKey
ALTER TABLE "ExperimentReagent" ADD CONSTRAINT "ExperimentReagent_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentReagent" ADD CONSTRAINT "ExperimentReagent_reagentId_fkey" FOREIGN KEY ("reagentId") REFERENCES "Reagent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
