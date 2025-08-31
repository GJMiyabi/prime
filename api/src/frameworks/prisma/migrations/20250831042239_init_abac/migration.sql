-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('EMAIL', 'PHONE', 'ADDRESS');

-- CreateEnum
CREATE TYPE "public"."PrincipalKind" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'STAKEHOLDER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContactAddress" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" "public"."ContactType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ContactAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Principal" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "kind" "public"."PrincipalKind" NOT NULL,

    CONSTRAINT "Principal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "principalId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Principal_personId_key" ON "public"."Principal"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_principalId_key" ON "public"."Account"("principalId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "public"."Account"("username");

-- AddForeignKey
ALTER TABLE "public"."ContactAddress" ADD CONSTRAINT "ContactAddress_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Principal" ADD CONSTRAINT "Principal_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "public"."Principal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
