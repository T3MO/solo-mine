/**
 * Admin Authentication Utilities
 * Simple token-based auth for single-user admin panel
 * Uses Web Crypto API (edge-runtime compatible, no Node.js dependencies)
 */

import { NextRequest } from "next/server";

// ============================================================================
// Configuration
// ============================================================================

export const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
export const COOKIE_NAME = "admin-token";
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// ============================================================================
// Password Hashing (Web Crypto API)
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + (process.env.PASSWORD_SALT || "solo-mine-salt"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================================
// Token Generation (Web Crypto API)
// ============================================================================

export function generateAdminToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ============================================================================
// Verification Functions
// ============================================================================

/**
 * Verify admin password against stored hash
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD_HASH) {
    console.error("ADMIN_PASSWORD_HASH not configured");
    return false;
  }

  const hashedInput = await hashPassword(password);
  return hashedInput === ADMIN_PASSWORD_HASH;
}

/**
 * Verify admin token using timing-safe comparison (Web Crypto compatible)
 */
export function verifyAdminToken(token: string | undefined): boolean {
  if (!ADMIN_TOKEN) {
    console.error("ADMIN_TOKEN not configured");
    return false;
  }

  if (!token) return false;

  const encoder = new TextEncoder();
  const tokenBuffer = encoder.encode(token);
  const adminBuffer = encoder.encode(ADMIN_TOKEN);

  if (tokenBuffer.length !== adminBuffer.length) return false;

  let result = 0;
  for (let i = 0; i < tokenBuffer.length; i++) {
    result |= tokenBuffer[i] ^ adminBuffer[i];
  }
  return result === 0;
}

/**
 * Check if request is authenticated (for middleware)
 */
export function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return verifyAdminToken(token);
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
    const lockedUntil = now + LOCKOUT_MS;
    rateLimitMap.set(ip, { ...entry, lockedUntil });
    return { allowed: false, remainingAttempts: 0, lockedUntil };
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
    rateLimitMap.set(ip, { attempts: 1, resetAt: now + WINDOW_MS });
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
export async function generateSetupCredentials(password: string): Promise<{
  token: string;
  passwordHash: string;
}> {
  return {
    token: generateAdminToken(),
    passwordHash: await hashPassword(password),
  };
}
