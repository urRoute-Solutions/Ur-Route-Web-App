import { z } from "zod";

export const createOperatorSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).optional(),
  contactEmail: z.string().email(),
  contactPhone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number")
    .optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
});

export const updateOperatorSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number")
    .optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  // Admin-only — enforced in updateOperatorUseCase, not here.
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
});

export const agentUpdateOperatorSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(500).optional(),
    logoUrl: z.string().url().optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number")
      .optional(),
    address: z.string().max(300).optional(),
    city: z.string().max(100).optional(),
    resolutionComments: z.string().min(10, "Resolution comments must be at least 10 characters").max(500),
  })
  .refine(
    (d) => Object.keys(d).some((k) => k !== "resolutionComments" && d[k as keyof typeof d] !== undefined),
    { message: "At least one field must be changed" },
  );

export const verifyUridSchema = z.object({
  urid: z.string().min(11).max(13),
});

export type CreateOperatorInput = z.infer<typeof createOperatorSchema>;
export type UpdateOperatorInput = z.infer<typeof updateOperatorSchema>;
export type AgentUpdateOperatorInput = z.infer<typeof agentUpdateOperatorSchema>;
export type VerifyUridInput = z.infer<typeof verifyUridSchema>;
