-- AlterTable
ALTER TABLE "routes" ADD COLUMN     "arrivalTime" TEXT,
ADD COLUMN     "availableFrom" TIMESTAMP(3),
ADD COLUMN     "availableUntil" TIMESTAMP(3),
ADD COLUMN     "departureTime" TEXT;
