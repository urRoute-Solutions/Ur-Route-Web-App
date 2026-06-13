import { ForbiddenError } from "@/lib/errors";

/**
 * Base class for all OPERATOR-scoped repositories (routes, trips, bookings,
 * offers, …). It is the application-layer guarantee that one operator can never
 * read or mutate another's rows.
 *
 * Why a base class rather than ad-hoc `where: { operatorId }` everywhere:
 *  • It's easy to forget the filter on one query and leak cross-tenant data.
 *  • Here, the tenant key is bound once at construction (`new RouteRepository(operatorId)`)
 *    and EVERY query must go through `tenantWhere()` / `assertOwnership()`.
 *  • Subclasses physically cannot build an unscoped query without bypassing the
 *    helper — which is grep-able in review.
 *
 * Postgres RLS (migration) is the defense-in-depth backstop; this is the
 * primary guard because it carries the request's authenticated tenant context.
 *
 * Usage:
 *   class RouteRepository extends TenantRepository {
 *     list() { return prisma.route.findMany({ where: this.tenantWhere() }); }
 *     get(id: string) {
 *       return prisma.route.findFirst({ where: this.tenantWhere({ id }) });
 *     }
 *   }
 *   const repo = new RouteRepository(principal.operatorId);
 */
export abstract class TenantRepository {
  constructor(protected readonly operatorId: string) {
    if (!operatorId) {
      // Constructing a tenant repo without a tenant is a programming error.
      throw new Error("TenantRepository requires a non-empty operatorId");
    }
  }

  /** Merge the tenant filter into a `where` clause. Always use for reads/writes. */
  protected tenantWhere<T extends Record<string, unknown>>(
    extra?: T,
  ): T & { operatorId: string } {
    return { ...(extra ?? ({} as T)), operatorId: this.operatorId };
  }

  /**
   * Verify a fetched row belongs to this tenant before returning/mutating it.
   * Use when an `update`/`delete` must target by primary key but you still need
   * the ownership check (Prisma updates can't always express it in `where`).
   */
  protected assertOwnership(row: { operatorId: string } | null): void {
    if (!row || row.operatorId !== this.operatorId) {
      // 403, not 404 details — don't reveal another tenant's row exists.
      throw new ForbiddenError("Resource does not belong to your operator");
    }
  }
}
