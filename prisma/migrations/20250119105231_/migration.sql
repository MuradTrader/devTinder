/*
  Warnings:

  - Made the column `firstName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photoUrl" TEXT DEFAULT 'This is a default about of the user!',
ADD COLUMN     "skills" TEXT[],
ALTER COLUMN "firstName" SET NOT NULL;
