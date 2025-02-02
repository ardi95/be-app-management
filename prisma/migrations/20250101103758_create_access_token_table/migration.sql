/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `access_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_status` on the `access_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refresh_token]` on the table `access_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "access_tokens_refresh_token_deleted_status_key";

-- AlterTable
ALTER TABLE "access_tokens" DROP COLUMN "deleted_at",
DROP COLUMN "deleted_status";

-- CreateIndex
CREATE UNIQUE INDEX "access_tokens_refresh_token_key" ON "access_tokens"("refresh_token");
