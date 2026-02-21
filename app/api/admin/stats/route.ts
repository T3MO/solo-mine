import { NextRequest, NextResponse } from "next/server";
import { getSubscriberStats } from "@/lib/email/service";

// ============================================================================
// Admin Stats API
// Returns subscriber statistics for the admin dashboard
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Simple auth check - in production, use proper authentication
    const authHeader = request.headers.get("authorization");
    const apiKey = process.env.ADMIN_API_KEY;
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const stats = await getSubscriberStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
