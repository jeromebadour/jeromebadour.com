import "server-only";
import { createHash, randomBytes } from "node:crypto";

/** A random token for a link or cookie, and the SHA-256 the database keeps instead of it. */
export function newToken(): { token: string; hash: Buffer } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: tokenHash(token) };
}

export function tokenHash(token: string): Buffer {
  return createHash("sha256").update(token).digest();
}
