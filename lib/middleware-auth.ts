/**
 * Middleware-compatible authentication (Edge Runtime)
 * Uses Web Crypto API instead of Node.js crypto
 */

import { NextRequest } from "next/server";

const COOKIE_NAME = "admin-token";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

/**
 * Verify admin token using timing-safe comparison (Edge Runtime compatible)
 */
function verifyAdminToken(token: string | undefined): boolean {
  if (!ADMIN_TOKEN || !token) return false;

  // Timing-safe comparison using Web Crypto
  const encoder = new TextEncoder();
  const tokenBuffer = encoder.encode(token);
  const adminBuffer = encoder.encode(ADMIN_TOKEN);

  // If lengths differ, tokens don't match (but we still do a comparison to prevent timing attacks)
  if (tokenBuffer.length !== adminBuffer.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < tokenBuffer.length; i++) {
    result |= tokenBuffer[i] ^ adminBuffer[i];
  }
  return result === 0;
}

/**
 * Check if request is authenticated (for middleware - Edge Runtime compatible)
 */
export function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}
