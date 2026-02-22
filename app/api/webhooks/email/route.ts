import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

// ============================================================================
// Webhook Handler for Email Provider Events
// Supports: Resend, ConvertKit, Mailgun, SendGrid
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = ReturnType<typeof createClient<any, any>>;

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (provider-specific)
    const provider = request.headers.get("x-email-provider") || "resend";
    
    switch (provider) {
      case "resend":
        return handleResendWebhook(request);
      case "convertkit":
        return handleConvertKitWebhook(request);
      default:
        return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// ============================================================================
// Resend Webhook Handler
// ============================================================================

async function handleResendWebhook(request: NextRequest) {
  const payload = await request.json();
  
  // Verify webhook signature (if configured)
  const signature = request.headers.get("x-resend-signature");
  if (process.env.RESEND_WEBHOOK_SECRET && signature) {
    // Verify signature here
    // const isValid = verifyResendSignature(payload, signature, process.env.RESEND_WEBHOOK_SECRET);
    // if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { type, data } = payload;
  
  // Get Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (type) {
    case "email.delivered":
      await updateEmailLog(supabase, data.email_id, "delivered");
      break;
      
    case "email.opened":
      await updateEmailLog(supabase, data.email_id, "opened", { opened_at: new Date().toISOString() });
      await updateSubscriberEngagement(supabase, data.to, "opened");
      break;
      
    case "email.clicked":
      await updateEmailLog(supabase, data.email_id, "clicked", { 
        clicked_at: new Date().toISOString(),
        click_url: data.click?.link 
      });
      await updateSubscriberEngagement(supabase, data.to, "clicked");
      break;
      
    case "email.bounced":
      await updateEmailLog(supabase, data.email_id, "bounced");
      await markSubscriberBounced(supabase, data.to);
      break;
      
    case "email.complained":
      // Mark as spam complaint
      await markSubscriberComplained(supabase, data.to);
      break;
  }

  return NextResponse.json({ received: true });
}

// ============================================================================
// ConvertKit Webhook Handler
// ============================================================================

async function handleConvertKitWebhook(request: NextRequest) {
  const payload = await request.json();
  const { event, subscriber } = payload;

  // Get Supabase client (for sync if using hybrid approach)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ received: true }); // No sync needed
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (event) {
    case "subscriber.subscribed":
      await syncConvertKitSubscriber(supabase, subscriber, "active");
      break;
      
    case "subscriber.unsubscribed":
      await syncConvertKitSubscriber(supabase, subscriber, "unsubscribed");
      break;
      
    case "subscriber.tagged":
      await updateConvertKitTags(supabase, subscriber);
      break;
  }

  return NextResponse.json({ received: true });
}

// ============================================================================
// Database Helpers
// ============================================================================

async function updateEmailLog(
  supabase: SupabaseClient,
  resendId: string,
  status: string,
  metadata?: Record<string, unknown>
) {
  const { error } = await supabase
    .from("email_logs")
    .update({ 
      status, 
      ...metadata,
      updated_at: new Date().toISOString() 
    })
    .eq("resend_id", resendId);

  if (error) console.error("Failed to update email log:", error);
}

async function updateSubscriberEngagement(
  supabase: SupabaseClient,
  email: string,
  type: "opened" | "clicked"
) {
  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("id, metadata")
    .eq("email", email.toLowerCase())
    .single();

  if (!subscriber) return;

  const key = type === "opened" ? "opens_count" : "clicks_count";
  const currentCount = (subscriber.metadata?.[key] as number) || 0;

  await supabase
    .from("subscribers")
    .update({
      metadata: {
        ...subscriber.metadata,
        [key]: currentCount + 1,
        [`last_${type}`]: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscriber.id);
}

async function markSubscriberBounced(
  supabase: SupabaseClient,
  email: string
) {
  const { error } = await supabase
    .from("subscribers")
    .update({ 
      status: "bounced",
      updated_at: new Date().toISOString() 
    })
    .eq("email", email.toLowerCase());

  if (error) console.error("Failed to mark bounced:", error);
}

async function markSubscriberComplained(
  supabase: SupabaseClient,
  email: string
) {
  const { error } = await supabase
    .from("subscribers")
    .update({ 
      status: "complained",
      updated_at: new Date().toISOString() 
    })
    .eq("email", email.toLowerCase());

  if (error) console.error("Failed to mark complained:", error);
}

async function syncConvertKitSubscriber(
  supabase: SupabaseClient,
  subscriber: { email_address: string; id: string; state: string },
  status: string
) {
  const { error } = await supabase
    .from("subscribers")
    .upsert({
      email: subscriber.email_address.toLowerCase(),
      status,
      metadata: { convertkit_id: subscriber.id },
      updated_at: new Date().toISOString(),
    }, { onConflict: "email" });

  if (error) console.error("Failed to sync ConvertKit subscriber:", error);
}

async function updateConvertKitTags(
  supabase: SupabaseClient,
  subscriber: { email_address: string; tags: string[] }
) {
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, tags")
    .eq("email", subscriber.email_address.toLowerCase())
    .single();

  if (!existing) return;

  const newTags = Array.from(new Set([...existing.tags, ...subscriber.tags]));

  await supabase
    .from("subscribers")
    .update({ 
      tags: newTags,
      updated_at: new Date().toISOString() 
    })
    .eq("id", existing.id);
}
