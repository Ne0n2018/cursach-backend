/*
  Warnings:

  - You are about to drop the `Subjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subjects" DROP CONSTRAINT "Subjects_teacherId_fkey";

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "subjects" "Subject"[];

-- DropTable
DROP TABLE "Subjects";
