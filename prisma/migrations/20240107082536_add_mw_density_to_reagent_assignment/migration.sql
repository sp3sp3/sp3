/*
  Warnings:

  - Added the required column `molecularWeight` to the `Reagent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reagent" ADD COLUMN     "density" DOUBLE PRECISION,
ADD COLUMN     "molecularWeight" DOUBLE PRECISION NOT NULL;
