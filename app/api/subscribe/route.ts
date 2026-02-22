import { NextRequest, NextResponse } from "next/server";
import { subscribeUser } from "@/lib/email/service";

export const runtime = "edge";

// ============================================================================
// Rate Limiting (Simple in-memory store)
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// ============================================================================
// Email Validation
// ============================================================================

function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 254;
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting — prefer Cloudflare header, then standard proxy header
    const ip =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "anonymous";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse body
    const body = await request.json();
    const { email, source, tags = [], metadata = {} } = body;

    // Validate required fields
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Honeypot check (should be empty)
    if (metadata.website) {
      // Silently accept but don't actually subscribe
      console.log("Honeypot triggered for IP:", ip);
      return NextResponse.json({ success: true });
    }

    // Subscribe user
    const result = await subscribeUser(normalizedEmail, tags, {
      ...metadata,
      source,
      ip: process.env.NODE_ENV === "production" ? undefined : ip, // Not stored in production (privacy/GDPR)
      subscribedAt: new Date().toISOString(),
    });

    if (!result.success) {
      // Don't reveal if email already exists
      if (result.error?.includes("already")) {
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { error: result.error || "Subscription failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================================
// CORS Headers
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
