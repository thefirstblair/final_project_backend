/*
  Warnings:

  - Added the required column `owner_name` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Note` ADD COLUMN `owner_name` VARCHAR(191) NOT NULL;
