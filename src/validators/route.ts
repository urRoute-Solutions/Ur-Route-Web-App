import { z } from "zod";

const stopSchema = z.object({
  name: z.string().min(1).max(100),
  landmark: z.string().max(200).optional(),
  time: z.string().optional(), // e.g. "06:30"
});

export const createRouteSchema = z.object({
  origin: z.string().min(2).max(100),
  destination: z.string().min(2).max(100),
  distanceKm: z.number().int().positive().optional(),
  durationMin: z.number().int().positive().optional(),
  boardingPoints: z.array(stopSchema).default([]),
  droppingPoints: z.array(stopSchema).default([]),
});

export const updateRouteSchema = z.object({
  origin: z.string().min(2).max(100).optional(),
  destination: z.string().min(2).max(100).optional(),
  distanceKm: z.number().int().positive().optional(),
  durationMin: z.number().int().positive().optional(),
  boardingPoints: z.array(stopSchema).optional(),
  droppingPoints: z.array(stopSchema).optional(),
  isActive: z.boolean().optional(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
