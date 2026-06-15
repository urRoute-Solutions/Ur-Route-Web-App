import { z } from "zod";

const passengerSchema = z.object({
  name: z.string().min(2).max(100),
  age: z.number().int().min(1).max(120),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  seatLabel: z.string().min(1).max(10),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

export const createBookingSchema = z.object({
  tripId: z.string().cuid(),
  seatIds: z.array(z.string().cuid()).min(1).max(10),
  passengers: z.array(passengerSchema).min(1).max(10),
  boardingPoint: z
    .object({ name: z.string(), landmark: z.string().optional() })
    .optional(),
  droppingPoint: z
    .object({ name: z.string(), landmark: z.string().optional() })
    .optional(),
  appliedOfferId: z.string().cuid().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
