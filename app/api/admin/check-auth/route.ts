import { NextResponse } from "next/server";
import { checkAuthStatus } from "@/lib/admin-actions";

export const runtime = "edge";

export async function GET() {
  const authenticated = await checkAuthStatus();
  return NextResponse.json({ authenticated });
}
