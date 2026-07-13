import { getRedis } from "@/lib/redis";

const heartbeatKey = (id: string) => `support:agent:heartbeat:${id}`;
const SET_KEY = "support:agents:online";
const HEARTBEAT_TTL = 60;

export async function setAgentOnline(agentId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await Promise.all([
    redis.set(heartbeatKey(agentId), "1", { ex: HEARTBEAT_TTL }),
    redis.sadd(SET_KEY, agentId),
  ]);
}

export async function setAgentOffline(agentId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await Promise.all([
    redis.del(heartbeatKey(agentId)),
    redis.srem(SET_KEY, agentId),
  ]);
}

export async function refreshHeartbeat(agentId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  // Also re-add to the SET in case the agent was pruned (TTL expired between heartbeats)
  await Promise.all([
    redis.set(heartbeatKey(agentId), "1", { ex: HEARTBEAT_TTL }),
    redis.sadd(SET_KEY, agentId),
  ]);
}

export async function getOnlineAgentIds(): Promise<string[]> {
  const redis = getRedis();
  if (!redis) return [];

  const members = (await redis.smembers(SET_KEY)) as string[];
  if (members.length === 0) return [];

  const alive = await Promise.all(
    members.map(async (id) => {
      const exists = await redis.exists(heartbeatKey(id));
      return exists ? id : null;
    }),
  );

  const online = alive.filter((id): id is string => id !== null);
  const stale = members.filter((id) => !online.includes(id));
  if (stale.length > 0) await redis.srem(SET_KEY, ...stale);

  return online;
}

export async function isAgentOnline(agentId: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const exists = await redis.exists(heartbeatKey(agentId));
  return exists > 0;
}
