-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'P4ssw0rd',
    "gender" VARCHAR(10) NOT NULL,
    "birthdate" DATE NOT NULL,
    "photo" TEXT,
    "active" TEXT NOT NULL DEFAULT 'No Active',
    "role_id" INTEGER NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "refresh_token" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "access_tokens_refresh_token_key" ON "access_tokens"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
