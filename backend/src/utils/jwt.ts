import jwt from "jsonwebtoken";
import { env } from "../config/env";

const tokenBlocklist = new Map<string, number>();

setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of tokenBlocklist) {
    if (expiry <= now) tokenBlocklist.delete(token);
  }
}, 60 * 1000);

export function blockToken(token: string, expiresAtSec: number): void {
  const expiryMs = expiresAtSec * 1000;
  if (expiryMs > Date.now()) {
    tokenBlocklist.set(token, expiryMs);
  }
}

export function isTokenBlocked(token: string): boolean {
  return tokenBlocklist.has(token);
}

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 3600;
    case "d": return value * 86400;
    default: return 900;
  }
}

const ACCESS_TOKEN_EXPIRY = parseExpiry(env.JWT_EXPIRES_IN);
const REFRESH_TOKEN_EXPIRY = parseExpiry(env.JWT_REFRESH_EXPIRES_IN);

export function signAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
  return payload.userId;
}

export function verifyRefreshToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
  return payload.userId;
}
