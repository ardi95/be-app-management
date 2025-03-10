/*
  Warnings:

  - You are about to drop the column `sort` on the `menus` table. All the data in the column will be lost.
  - Added the required column `order_number` to the `menus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "menus" DROP COLUMN "sort",
ADD COLUMN     "order_number" INTEGER NOT NULL;
