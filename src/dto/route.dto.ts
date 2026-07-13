import type { Route } from "@prisma/client";

export interface RouteDTO {
  id: string;
  operatorId: string;
  origin: string;
  destination: string;
  distanceKm: number | null;
  durationMin: number | null;
  departureTime: string | null;
  arrivalTime: string | null;
  basePriceMinor: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  boardingPoints: unknown;
  droppingPoints: unknown;
  isActive: boolean;
  createdAt: string;
}

export function toRouteDTO(route: Route): RouteDTO {
  return {
    id: route.id,
    operatorId: route.operatorId,
    origin: route.origin,
    destination: route.destination,
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    departureTime: route.departureTime,
    arrivalTime: route.arrivalTime,
    basePriceMinor: route.basePriceMinor,
    availableFrom: route.availableFrom ? route.availableFrom.toISOString() : null,
    availableUntil: route.availableUntil ? route.availableUntil.toISOString() : null,
    boardingPoints: route.boardingPoints,
    droppingPoints: route.droppingPoints,
    isActive: route.isActive,
    createdAt: route.createdAt.toISOString(),
  };
}
