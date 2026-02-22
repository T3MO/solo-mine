import { NextRequest, NextResponse } from "next/server";
import { unsubscribeUser } from "@/lib/email/service";

export const runtime = "edge";
import { getUnsubscribeConfirmationTemplate } from "@/components/email/templates";
import { sendEmailWithResend } from "@/lib/email/service";

export async function POST(request: NextRequest) {
  try {
    const { email, type = "all" } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Unsubscribe user
    const result = await unsubscribeUser(normalizedEmail);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Unsubscribe failed" },
        { status: 500 }
      );
    }

    // Send confirmation email
    const template = getUnsubscribeConfirmationTemplate({ email: normalizedEmail });
    await sendEmailWithResend(normalizedEmail, template.subject, template.html);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
