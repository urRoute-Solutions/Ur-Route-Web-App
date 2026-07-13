function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

// Overnight-aware: if arrival <= departure, the arrival is treated as next day.
export function computeDurationMinutes(departure: string, arrival: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(departure)) return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(arrival)) return null;
  const dep = toMinutes(departure);
  let arr = toMinutes(arrival);
  if (arr <= dep) arr += 24 * 60;
  return arr - dep;
}

export function formatDuration(minutes: number | null): string {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}
