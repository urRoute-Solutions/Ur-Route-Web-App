import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { updateOfferTemplateSchema } from "@/validators/offer-template";
import { updateOfferTemplateUseCase } from "@/usecases/offers/update-offer-template.usecase";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id, templateId } = await params;
    const input = updateOfferTemplateSchema.parse(await req.json());
    const template = await updateOfferTemplateUseCase(id, templateId, input, principal);
    return ok({ template });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> },
) {
  try {
    const principal = await requireAuth();
    const { id: operatorId, templateId } = await params;

    if (principal.role !== "OPERATOR" && principal.role !== "ADMIN") {
      throw new ForbiddenError("Operators only");
    }
    if (principal.role === "OPERATOR" && principal.operatorId !== operatorId) {
      throw new ForbiddenError("Not your operator");
    }

    const template = await offerTemplateRepository.findById(templateId);
    if (!template || template.operatorId !== operatorId) throw new NotFoundError("Offer template");

    const deleted = await offerTemplateRepository.softDelete(templateId);
    return ok({ template: deleted });
  } catch (error) {
    return handleError(error);
  }
}
