import { z } from "zod";

const stopSchema = z.object({
  name: z.string().min(1).max(100),
  landmark: z.string().max(200).optional(),
  time: z.string().optional(), // e.g. "06:30"
});

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24h HH:mm format");

export const createRouteSchema = z
  .object({
    origin: z.string().min(2).max(100),
    destination: z.string().min(2).max(100),
    distanceKm: z.number().int().positive(),
    durationMin: z.number().int().positive().optional(),
    departureTime: timeSchema,
    arrivalTime: timeSchema,
    basePriceMinor: z.number().int().positive(),
    availableFrom: z.coerce.date(),
    availableUntil: z.coerce.date().optional(),
    boardingPoints: z.array(stopSchema).default([]),
    droppingPoints: z.array(stopSchema).default([]),
  })
  .refine((d) => d.origin.trim().toLowerCase() !== d.destination.trim().toLowerCase(), {
    message: "Origin and destination cannot be the same",
    path: ["destination"],
  })
  .refine((d) => !d.availableUntil || d.availableUntil > d.availableFrom, {
    message: "Available Until must be after Available From",
    path: ["availableUntil"],
  });

export const updateRouteSchema = z.object({
  origin: z.string().min(2).max(100).optional(),
  destination: z.string().min(2).max(100).optional(),
  distanceKm: z.number().int().positive().optional(),
  durationMin: z.number().int().positive().optional(),
  departureTime: timeSchema.optional(),
  arrivalTime: timeSchema.optional(),
  basePriceMinor: z.number().int().positive().optional(),
  availableFrom: z.coerce.date().optional(),
  availableUntil: z.coerce.date().optional(),
  boardingPoints: z.array(stopSchema).optional(),
  droppingPoints: z.array(stopSchema).optional(),
  isActive: z.boolean().optional(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
