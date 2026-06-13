import { routeRepository } from "@/repositories/route.repository";
import { toRouteDTO, type RouteDTO } from "@/dto/route.dto";

export async function listRoutesUseCase(
  operatorId: string,
  params: { isActive?: boolean; page?: number; pageSize?: number },
): Promise<{ items: RouteDTO[]; total: number; page: number; pageSize: number }> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const [routes, total] = await routeRepository.listByOperator(operatorId, {
    isActive: params.isActive,
    page,
    pageSize,
  });

  return { items: routes.map(toRouteDTO), total, page, pageSize };
}
