"use server";

/**
 * Admin Server Actions
 * These functions run on the server only and handle cookie management
 */

import { cookies } from "next/headers";
import {
  ADMIN_TOKEN,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
  verifyAdminPassword,
  verifyAdminToken,
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulLogin,
} from "./admin-auth";

export async function adminLogin(
  password: string,
  rememberMe: boolean,
  ip: string
): Promise<{ success: boolean; error?: string }> {
  // Check rate limit
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    const minutes = rateLimit.lockedUntil
      ? Math.ceil((rateLimit.lockedUntil - Date.now()) / 60000)
      : 0;
    return {
      success: false,
      error: `Too many attempts. Try again in ${minutes} minutes.`,
    };
  }

  // Verify password
  if (!await verifyAdminPassword(password)) {
    recordFailedAttempt(ip);
    return {
      success: false,
      error: `Invalid password. ${rateLimit.remainingAttempts - 1} attempts remaining.`,
    };
  }

  // Success - set cookie
  recordSuccessfulLogin(ip);

  if (!ADMIN_TOKEN) {
    return {
      success: false,
      error: "Server configuration error",
    };
  }

  const maxAge = rememberMe ? COOKIE_MAX_AGE : undefined;
  
  cookies().set(COOKIE_NAME, ADMIN_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
    path: "/admin",
  });

  return { success: true };
}

export async function adminLogout(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

export async function checkAuthStatus(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}
