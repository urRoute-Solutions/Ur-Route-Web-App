import type { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/http";
import { requireAgent } from "@/lib/auth/session";
import { setAgentOnline, setAgentOffline, refreshHeartbeat, isAgentOnline } from "@/lib/agent-presence";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await requireAgent();
    const online = await isAgentOnline(userId);
    return ok({ online });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAgent();
    const body = await req.json();
    if (body.action === "heartbeat") {
      await refreshHeartbeat(userId);
      return ok({ ok: true });
    }
    if (body.online) {
      await setAgentOnline(userId);
    } else {
      await setAgentOffline(userId);
    }
    return ok({ online: body.online });
  } catch (err) {
    return handleError(err);
  }
}
