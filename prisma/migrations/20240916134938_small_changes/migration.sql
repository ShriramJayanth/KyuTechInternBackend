/*
  Warnings:

  - Added the required column `firstTime` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seedName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstTime" BOOLEAN NOT NULL,
ADD COLUMN     "seedName" TEXT NOT NULL;
