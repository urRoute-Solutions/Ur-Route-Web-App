import { z } from "zod";

const seatInputSchema = z.object({
  label: z.string().min(1).max(10),
  deck: z.enum(["LOWER", "UPPER"]).default("LOWER"),
  priceMinor: z.number().int().positive(),
  isLadies: z.boolean().default(false),
});

export const createTripSchema = z.object({
  routeId: z.string().cuid(),
  busName: z.string().min(2).max(100),
  seatType: z.enum(["SEATER", "SLEEPER"]).default("SLEEPER"),
  layout: z.string().default("2+1"),
  basePriceMinor: z.number().int().positive(),
  departureAt: z.string().datetime(),
  arrivalAt: z.string().datetime(),
  amenities: z.array(z.string()).default([]),
  seats: z.array(seatInputSchema).min(1),
});

export const updateTripSchema = z.object({
  busName: z.string().min(2).max(100).optional(),
  basePriceMinor: z.number().int().positive().optional(),
  departureAt: z.string().datetime().optional(),
  arrivalAt: z.string().datetime().optional(),
  amenities: z.array(z.string()).optional(),
  status: z.enum(["SCHEDULED", "DEPARTED", "COMPLETED", "CANCELLED"]).optional(),
});

export const searchTripsSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  date: z.string().date(), // YYYY-MM-DD
  passengers: z.coerce.number().int().min(1).max(10).default(1),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type SearchTripsInput = z.infer<typeof searchTripsSchema>;
