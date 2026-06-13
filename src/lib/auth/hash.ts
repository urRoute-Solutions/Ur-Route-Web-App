/**
 * SHA-256 hex digest via Web Crypto (runtime-agnostic: Node + edge).
 * Used to store refresh tokens hashed at rest — a DB leak then can't replay
 * tokens. Not for passwords (those use bcrypt).
 */
export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
