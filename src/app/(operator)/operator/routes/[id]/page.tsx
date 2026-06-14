import { requireOperator } from "@/lib/auth/session";
import { routeRepository } from "@/repositories/route.repository";
import { notFound } from "next/navigation";
import { EditRouteForm } from "./edit-route-form";

export default async function EditRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { operatorId } = await requireOperator();
  const { id } = await params;

  const route = await routeRepository.findById(id, operatorId);
  if (!route) notFound();

  return (
    <EditRouteForm
      routeId={route.id}
      operatorId={operatorId}
      initial={{
        origin: route.origin,
        destination: route.destination,
        distanceKm: route.distanceKm?.toString() ?? "",
        durationMin: route.durationMin?.toString() ?? "",
        isActive: route.isActive,
      }}
    />
  );
}
