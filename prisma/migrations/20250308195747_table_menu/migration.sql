-- CreateTable
CREATE TABLE "menus" (
    "id" SERIAL NOT NULL,
    "key_menu" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sort" INTEGER NOT NULL,
    "active" TEXT NOT NULL DEFAULT 'Active',
    "created_by" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menus_key_menu_key" ON "menus"("key_menu");

-- CreateIndex
CREATE UNIQUE INDEX "menus_name_key" ON "menus"("name");
