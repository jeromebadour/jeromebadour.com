import "server-only";
import { cookies, headers } from "next/headers";
import { randomBytes } from "node:crypto";

// Visitors have no accounts. Limits count uses per visitor key: an anonymous cookie id, and the IP address the box's
// Nginx passes in X-Real-IP. Both are kept only in limit_hits and deleted after a day (Privacy Policy 2.4).
export const VISITOR_COOKIE = process.env.NODE_ENV === "production" ? "__Host-v" : "v";

export async function visitorKeys(): Promise<string[]> {
  const jar = await cookies();
  let id = jar.get(VISITOR_COOKIE)?.value;
  if (!id || !/^[A-Za-z0-9_-]{16,64}$/.test(id)) {
    id = randomBytes(16).toString("base64url");
    jar.set(VISITOR_COOKIE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 86_400 });
  }
  const ip = (await headers()).get("x-real-ip")?.trim();
  return ip ? [`c:${id}`, `ip:${ip}`] : [`c:${id}`];
}
