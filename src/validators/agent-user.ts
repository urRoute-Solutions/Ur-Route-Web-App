import { z } from "zod";

export const agentUpdateUserSchema = z
  .object({
    fullName: z.string().min(2).max(120).optional(),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number")
      .optional(),
    resolutionComments: z.string().min(10, "Resolution comments must be at least 10 characters").max(500),
  })
  .refine(
    (d) => Object.keys(d).some((k) => k !== "resolutionComments" && d[k as keyof typeof d] !== undefined),
    { message: "At least one field must be changed" },
  );

export type AgentUpdateUserInput = z.infer<typeof agentUpdateUserSchema>;
