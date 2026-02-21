import { NextResponse } from "next/server";
import { checkAuthStatus } from "@/lib/admin-actions";

export async function GET() {
  const authenticated = await checkAuthStatus();
  return NextResponse.json({ authenticated });
}
