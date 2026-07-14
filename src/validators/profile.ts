import { z } from "zod";

/** Profile update — all fields optional (PATCH semantics), at least one required. */
export const updateProfileSchema = z
  .object({
    fullName: z.string().min(2).max(120).optional(),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number")
      .nullable()
      .optional(),
    avatarUrl: z.string().url().optional(),
    birthday: z.coerce.date().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "Provide at least one field to update",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
