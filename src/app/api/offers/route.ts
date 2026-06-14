import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireOperator } from "@/lib/auth/session";
import { createOfferTemplateSchema } from "@/validators/offer-template";
import { createOfferTemplateUseCase } from "@/usecases/offers/create-offer-template.usecase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const principal = await requireOperator();
    const input = createOfferTemplateSchema.parse(await req.json());
    const template = await createOfferTemplateUseCase(principal.operatorId, input, principal);
    return ok({ template }, 201);
  } catch (error) {
    return handleError(error);
  }
}
