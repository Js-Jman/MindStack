/*
  Warnings:

  - Added the required column `completed_at` to the `lesson_progress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lesson_progress` ADD COLUMN `completed_at` DATETIME(3) NOT NULL;
