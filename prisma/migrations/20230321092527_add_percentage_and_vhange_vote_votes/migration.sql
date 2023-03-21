/*
  Warnings:

  - You are about to drop the column `vote` on the `Choice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Choice` DROP COLUMN `vote`,
    ADD COLUMN `percentage` INTEGER NULL DEFAULT 0,
    ADD COLUMN `votes` INTEGER NULL DEFAULT 0;
