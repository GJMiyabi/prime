-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('EMAIL', 'PHONE', 'ADDRESS');

-- CreateEnum
CREATE TYPE "public"."PrincipalKind" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'STAKEHOLDER');

-- CreateTable
CREATE TABLE "public"."Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "IDNumber" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "IDNumber" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContactAddress" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" "public"."ContactType" NOT NULL,
    "value" TEXT NOT NULL,
    "organizationId" TEXT,
    "facilityId" TEXT,

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
    "provider" TEXT NOT NULL DEFAULT 'auth0',
    "providerSub" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_FacilityToPerson" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FacilityToPerson_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Person_organizationId_idx" ON "public"."Person"("organizationId");

-- CreateIndex
CREATE INDEX "Facility_organizationId_idx" ON "public"."Facility"("organizationId");

-- CreateIndex
CREATE INDEX "ContactAddress_organizationId_idx" ON "public"."ContactAddress"("organizationId");

-- CreateIndex
CREATE INDEX "ContactAddress_facilityId_idx" ON "public"."ContactAddress"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Principal_personId_key" ON "public"."Principal"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_principalId_key" ON "public"."Account"("principalId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "public"."Account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerSub_key" ON "public"."Account"("providerSub");

-- CreateIndex
CREATE INDEX "_FacilityToPerson_B_index" ON "public"."_FacilityToPerson"("B");

-- AddForeignKey
ALTER TABLE "public"."Person" ADD CONSTRAINT "Person_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Facility" ADD CONSTRAINT "Facility_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactAddress" ADD CONSTRAINT "ContactAddress_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactAddress" ADD CONSTRAINT "ContactAddress_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactAddress" ADD CONSTRAINT "ContactAddress_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "public"."Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Principal" ADD CONSTRAINT "Principal_personId_fkey" FOREIGN KEY ("personId") REFERENCES "public"."Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "public"."Principal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FacilityToPerson" ADD CONSTRAINT "_FacilityToPerson_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FacilityToPerson" ADD CONSTRAINT "_FacilityToPerson_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
