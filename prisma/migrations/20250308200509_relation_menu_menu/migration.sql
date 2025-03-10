-- AlterTable
ALTER TABLE "menus" ADD COLUMN     "menu_id" INTEGER;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
