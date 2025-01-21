/*
  Warnings:

  - Made the column `lastName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "about" TEXT,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "age" SET DEFAULT 18;
