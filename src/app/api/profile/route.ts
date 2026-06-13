import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAuth } from "@/lib/auth/session";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { updateProfileSchema } from "@/validators/profile";
import { getProfileUseCase } from "@/usecases/profile/get-profile.usecase";
import { updateProfileUseCase } from "@/usecases/profile/update-profile.usecase";
import { deleteProfileUseCase } from "@/usecases/profile/delete-profile.usecase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    return ok({ user: await getProfileUseCase(userId) });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const input = updateProfileSchema.parse(await req.json());
    return ok({ user: await updateProfileUseCase(userId, input) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE() {
  try {
    const { userId } = await requireAuth();
    await deleteProfileUseCase(userId);
    await clearAuthCookies();
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
