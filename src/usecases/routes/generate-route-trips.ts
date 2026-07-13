import { tripRepository } from "@/repositories/trip.repository";

const DEFAULT_SEATS = 40;
const MAX_GENERATED_DAYS = 90; // cap writes for very long / open-ended availability windows
const OPEN_ENDED_WINDOW_DAYS = 30; // rolling window used when Available Until is not set

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function combineDateAndTime(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0, 0);
}

export function generateTripDays(availableFrom: Date, availableUntil: Date | null | undefined): Date[] {
  const start = startOfLocalDay(availableFrom);
  let end = availableUntil
    ? startOfLocalDay(availableUntil)
    : new Date(start.getFullYear(), start.getMonth(), start.getDate() + (OPEN_ENDED_WINDOW_DAYS - 1));

  const maxEnd = new Date(start.getFullYear(), start.getMonth(), start.getDate() + (MAX_GENERATED_DAYS - 1));
  if (end.getTime() > maxEnd.getTime()) end = maxEnd;

  const days: Date[] = [];
  const cur = new Date(start);
  while (cur.getTime() <= end.getTime()) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/**
 * Auto-generates one bookable Trip per day across the route's availability
 * window, so a published route is immediately searchable without a separate
 * manual "Schedule Trip" step. Bus name/seat count use sensible defaults
 * until real bus/seat-layout selection exists.
 */
export async function generateRouteTrips(params: {
  operatorId: string;
  operatorName: string;
  routeId: string;
  departureTime: string; // "HH:mm"
  arrivalTime: string; // "HH:mm"
  basePriceMinor: number;
  availableFrom: Date;
  availableUntil?: Date;
}): Promise<number> {
  const days = generateTripDays(params.availableFrom, params.availableUntil);
  const seats = Array.from({ length: DEFAULT_SEATS }, (_, i) => ({
    label: `L${i + 1}`,
    deck: "LOWER" as const,
    priceMinor: params.basePriceMinor,
    isLadies: false,
  }));

  // Bounded concurrency: firing one write per day via Promise.all can exhaust
  // Prisma's connection pool (default limit 5) once a window spans more than
  // a handful of days, causing a pool-timeout 500 on route creation.
  const CONCURRENCY = 3;
  for (let i = 0; i < days.length; i += CONCURRENCY) {
    const batch = days.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map((day) => {
        const departureAt = combineDateAndTime(day, params.departureTime);
        let arrivalAt = combineDateAndTime(day, params.arrivalTime);
        if (arrivalAt.getTime() <= departureAt.getTime()) {
          arrivalAt = new Date(arrivalAt.getTime() + 24 * 60 * 60 * 1000);
        }
        return tripRepository.createWithSeats(
          {
            operator: { connect: { id: params.operatorId } },
            route: { connect: { id: params.routeId } },
            busName: `${params.operatorName} Express`,
            totalSeats: DEFAULT_SEATS,
            availableSeats: DEFAULT_SEATS,
            basePriceMinor: params.basePriceMinor,
            departureAt,
            arrivalAt,
          },
          seats,
        );
      }),
    );
  }

  return days.length;
}
