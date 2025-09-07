-- AlterTable
ALTER TABLE "public"."ContactAddress" ADD COLUMN     "facilityId" TEXT,
ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "public"."Person" ADD COLUMN     "facilityId" TEXT,
ADD COLUMN     "organizationId" TEXT;

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

-- CreateIndex
CREATE INDEX "Facility_organizationId_idx" ON "public"."Facility"("organizationId");

-- CreateIndex
CREATE INDEX "ContactAddress_organizationId_idx" ON "public"."ContactAddress"("organizationId");

-- CreateIndex
CREATE INDEX "ContactAddress_facilityId_idx" ON "public"."ContactAddress"("facilityId");

-- CreateIndex
CREATE INDEX "Person_facilityId_idx" ON "public"."Person"("facilityId");

-- CreateIndex
CREATE INDEX "Person_organizationId_idx" ON "public"."Person"("organizationId");

-- AddForeignKey
ALTER TABLE "public"."Person" ADD CONSTRAINT "Person_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "public"."Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Person" ADD CONSTRAINT "Person_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Facility" ADD CONSTRAINT "Facility_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactAddress" ADD CONSTRAINT "ContactAddress_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactAddress" ADD CONSTRAINT "ContactAddress_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "public"."Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;
