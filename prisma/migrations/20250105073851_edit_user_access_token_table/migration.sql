/*
  Warnings:

  - You are about to alter the column `refresh_token` on the `access_tokens` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Added the required column `token` to the `access_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "access_tokens" ADD COLUMN     "token" VARCHAR(255) NOT NULL,
ALTER COLUMN "refresh_token" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "birthdate" SET DATA TYPE DATE;
