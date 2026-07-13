-- AlterTable
ALTER TABLE "operators" ADD COLUMN "urid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "operators_urid_key" ON "operators"("urid");
