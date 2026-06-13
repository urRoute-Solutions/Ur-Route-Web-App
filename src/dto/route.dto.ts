import type { Route } from "@prisma/client";

export interface RouteDTO {
  id: string;
  operatorId: string;
  origin: string;
  destination: string;
  distanceKm: number | null;
  durationMin: number | null;
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
    boardingPoints: route.boardingPoints,
    droppingPoints: route.droppingPoints,
    isActive: route.isActive,
    createdAt: route.createdAt.toISOString(),
  };
}
