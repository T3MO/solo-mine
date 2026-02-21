/**
 * Admin Authentication Utilities
 * Simple token-based auth for single-user admin panel
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";

// ============================================================================
// Configuration
// ============================================================================

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const COOKIE_NAME = "admin-token";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// ============================================================================
// Password Hashing
// ============================================================================

export function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + (process.env.PASSWORD_SALT || "solo-mine-salt"))
    .digest("hex");
}

// ============================================================================
// Token Generation
// ============================================================================

export function generateAdminToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ============================================================================
// Verification Functions
// ============================================================================

/**
 * Verify admin password against stored hash
 */
export function verifyAdminPassword(password: string): boolean {
  if (!ADMIN_PASSWORD_HASH) {
    console.error("ADMIN_PASSWORD_HASH not configured");
    return false;
  }

  const hashedInput = hashPassword(password);
  return hashedInput === ADMIN_PASSWORD_HASH;
}

/**
 * Verify admin token from cookie
 */
export function verifyAdminToken(token: string | undefined): boolean {
  if (!ADMIN_TOKEN) {
    console.error("ADMIN_TOKEN not configured");
    return false;
  }

  if (!token) return false;

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(ADMIN_TOKEN)
    );
  } catch {
    // Different lengths will throw, return false
    return false;
  }
}

/**
 * Check if request is authenticated (for middleware)
 */
export function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

// ============================================================================
// Cookie Management
// ============================================================================

export function setAdminCookie(token: string): void {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/admin",
  });
}

export function clearAdminCookie(): void {
  cookies().delete(COOKIE_NAME);
}

// ============================================================================
// Rate Limiting (Simple in-memory)
// ============================================================================

type RateLimitEntry = {
  attempts: number;
  resetAt: number;
  lockedUntil?: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil?: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up expired entries
  if (entry && now > entry.resetAt) {
    rateLimitMap.delete(ip);
  }

  // Check if locked out
  if (entry?.lockedUntil && now < entry.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: entry.lockedUntil,
    };
  }

  // Check attempts
  if (entry && entry.attempts >= MAX_ATTEMPTS) {
    // Lock out the IP
    const lockedUntil = now + LOCKOUT_MS;
    rateLimitMap.set(ip, {
      ...entry,
      lockedUntil,
    });

    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil,
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - (entry?.attempts || 0),
  };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, {
      attempts: 1,
      resetAt: now + WINDOW_MS,
    });
  } else {
    entry.attempts++;
  }
}

export function recordSuccessfulLogin(ip: string): void {
  rateLimitMap.delete(ip);
}

// ============================================================================
// Setup Helper
// ============================================================================

/**
 * Generate a secure admin token and password hash for setup
 * Run this once to get your env vars
 */
export function generateSetupCredentials(password: string): {
  token: string;
  passwordHash: string;
} {
  return {
    token: generateAdminToken(),
    passwordHash: hashPassword(password),
  };
}

// ============================================================================
// Server Actions
// ============================================================================

"use server";

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
  if (!verifyAdminPassword(password)) {
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

  setAdminCookie(ADMIN_TOKEN);

  return { success: true };
}

export async function adminLogout(): Promise<void> {
  clearAdminCookie();
}

export async function checkAuthStatus(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}
