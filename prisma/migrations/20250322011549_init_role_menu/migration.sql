-- CreateTable
CREATE TABLE "role_menus" (
    "role_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "create" BOOLEAN NOT NULL,
    "update" BOOLEAN NOT NULL,
    "delete" BOOLEAN NOT NULL,
    "approval" BOOLEAN NOT NULL,
    "approval_2" BOOLEAN NOT NULL,
    "approval_3" BOOLEAN NOT NULL,

    CONSTRAINT "role_menus_pkey" PRIMARY KEY ("role_id","menu_id")
);

-- AddForeignKey
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
