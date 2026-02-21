import { NextResponse } from "next/server";
import { checkAuthStatus } from "@/lib/admin-auth";

export async function GET() {
  const authenticated = await checkAuthStatus();
  return NextResponse.json({ authenticated });
}
