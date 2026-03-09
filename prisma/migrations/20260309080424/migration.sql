/*
  Warnings:

  - Added the required column `completed_at` to the `lesson_progress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- changed to allow NULL so existing rows can exist and completion is optional
ALTER TABLE `lesson_progress` ADD COLUMN `completed_at` DATETIME(3) NULL;
