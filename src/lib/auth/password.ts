import bcrypt from "bcryptjs";
import { BCRYPT_ROUNDS } from "@/constants/auth";

/**
 * Password hashing via bcryptjs (pure JS — runs on Vercel's serverless Node
 * runtime without native build steps, unlike the `bcrypt` native addon).
 * NOTE: bcrypt must run in the Node runtime, never the edge middleware.
 */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
