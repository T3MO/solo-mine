import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  dependencies: {
    database: "ok" | "error" | "not_configured";
    email_service: "ok" | "error" | "not_configured";
    mempool_api: "ok" | "error";
  };
  environment: string;
  region?: string;
}

export async function GET() {
  const startTime = Date.now();
  const version = process.env.npm_package_version || "1.0.0";
  const environment = process.env.NODE_ENV || "development";

  const dependencies: HealthStatus["dependencies"] = {
    database: "not_configured",
    email_service: "not_configured",
    mempool_api: "ok",
  };

  // Check database
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      );
      
      const { error } = await supabase.from("subscribers").select("count", { count: "exact", head: true });
      dependencies.database = error ? "error" : "ok";
    } catch {
      dependencies.database = "error";
    }
  }

  // Check email service
  if (process.env.RESEND_API_KEY || process.env.CONVERTKIT_API_KEY) {
    dependencies.email_service = "ok";
  }

  // Check Mempool API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const mempoolResponse = await fetch("https://mempool.space/api/blocks/tip/height", {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    dependencies.mempool_api = mempoolResponse.ok ? "ok" : "error";
  } catch {
    dependencies.mempool_api = "error";
  }

  const errorCount = Object.values(dependencies).filter((d) => d === "error").length;
  const notConfiguredCount = Object.values(dependencies).filter((d) => d === "not_configured").length;

  let status: HealthStatus["status"] = "healthy";
  if (errorCount > 0) {
    status = errorCount >= 2 ? "unhealthy" : "degraded";
  } else if (notConfiguredCount >= 2) {
    status = "degraded";
  }

  const health: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version,
    uptime: Date.now() - startTime,
    dependencies,
    environment,
    region: process.env.VERCEL_REGION,
  };

  const statusCode = status === "unhealthy" ? 503 : 200;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Health-Status": status,
    },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
