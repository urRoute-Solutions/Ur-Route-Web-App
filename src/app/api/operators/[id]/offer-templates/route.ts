import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { createOfferTemplateSchema } from "@/validators/offer-template";
import { createOfferTemplateUseCase } from "@/usecases/offers/create-offer-template.usecase";
import { offerTemplateRepository } from "@/repositories/offer-template.repository";
import { toOfferTemplateDTO } from "@/dto/reward.dto";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const principal = await requireAuth();
    const { id } = await params;
    const input = createOfferTemplateSchema.parse(await req.json());
    const template = await createOfferTemplateUseCase(id, input, principal);
    return ok({ template }, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const templates = await offerTemplateRepository.listByOperator(id);
    return ok({ templates: templates.map(toOfferTemplateDTO) });
  } catch (error) {
    return handleError(error);
  }
}
