/*
  Warnings:

  - You are about to drop the `role_menus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "role_menus" DROP CONSTRAINT "role_menus_menu_id_fkey";

-- DropForeignKey
ALTER TABLE "role_menus" DROP CONSTRAINT "role_menus_role_id_fkey";

-- DropTable
DROP TABLE "role_menus";

-- CreateTable
CREATE TABLE "role_menu" (
    "role_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "create" BOOLEAN NOT NULL,
    "update" BOOLEAN NOT NULL,
    "delete" BOOLEAN NOT NULL,
    "approval" BOOLEAN NOT NULL,
    "approval_2" BOOLEAN NOT NULL,
    "approval_3" BOOLEAN NOT NULL,

    CONSTRAINT "role_menu_pkey" PRIMARY KEY ("role_id","menu_id")
);

-- AddForeignKey
ALTER TABLE "role_menu" ADD CONSTRAINT "role_menu_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menu" ADD CONSTRAINT "role_menu_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
