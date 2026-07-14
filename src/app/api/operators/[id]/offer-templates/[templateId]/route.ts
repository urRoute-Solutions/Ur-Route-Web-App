import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { updateOfferTemplateSchema } from "@/validators/offer-template";
import { updateOfferTemplateUseCase } from "@/usecases/offers/update-offer-template.usecase";
import { deleteOfferTemplateUseCase } from "@/usecases/offers/delete-offer-template.usecase";

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
    const { id, templateId } = await params;
    await deleteOfferTemplateUseCase(id, templateId, principal);
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
