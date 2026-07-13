import { z } from "zod";

/**
 * Auth input schemas — the single source of truth for request shape. Route
 * handlers parse with these; the frontend reuses them via react-hook-form, so
 * client and server validation can never drift.
 */

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password too long") // bcrypt truncates at 72 bytes
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number");

export const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().toLowerCase(),
  phone: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number").optional(),
  ),
  password,
  referralCode: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().min(4).max(12).optional(),
  ),
});

export const registerOperatorSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().toLowerCase(),
  phone: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number").optional(),
  ),
  password,
  companyName: z.string().min(2).max(120),
  contactEmail: z.string().email(),
  contactPhone: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number").optional(),
  ),
  address: z.preprocess((v) => (v === "" ? undefined : v), z.string().max(300).optional()),
  city: z.preprocess((v) => (v === "" ? undefined : v), z.string().max(100).optional()),
});

export const loginSchema = z.object({
  // "Username, email & phone number" per the design — accept any identifier.
  identifier: z.string().min(3),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterOperatorInput = z.infer<typeof registerOperatorSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
