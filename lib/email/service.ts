/**
 * Email Service
 * Abstraction layer supporting both Supabase/Resend and ConvertKit
 */

// ============================================================================
// Types
// ============================================================================

export interface Subscriber {
  id?: string;
  email: string;
  status: "active" | "unsubscribed" | "bounced" | "pending";
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailLog {
  id?: string;
  subscriberId: string;
  email: string;
  template: string;
  subject: string;
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  metadata?: Record<string, unknown>;
}

export type EmailProvider = "supabase" | "convertkit";

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // Supabase + Resend configuration
  supabase: {
    enabled: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.RESEND_API_KEY
    ),
    resendFrom: process.env.RESEND_FROM_EMAIL || "noreply@solomine.io",
    resendReplyTo: process.env.RESEND_REPLY_TO || "support@solomine.io",
  },
  // ConvertKit configuration
  convertkit: {
    enabled: !!(
      process.env.CONVERTKIT_API_KEY &&
      process.env.CONVERTKIT_FORM_ID
    ),
    apiKey: process.env.CONVERTKIT_API_KEY,
    apiSecret: process.env.CONVERTKIT_API_SECRET,
    formId: process.env.CONVERTKIT_FORM_ID,
  },
};

// Determine which provider to use
export function getEmailProvider(): EmailProvider {
  if (CONFIG.convertkit.enabled) return "convertkit";
  if (CONFIG.supabase.enabled) return "supabase";
  throw new Error("No email provider configured");
}

// ============================================================================
// Supabase + Resend Implementation
// ============================================================================

import { createClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error("Supabase not configured");
    }
    
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

export async function subscribeWithSupabase(
  email: string,
  tags: string[],
  metadata: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, email, tags, metadata, status")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      // Update existing subscriber
      const { error } = await supabase
        .from("subscribers")
        .update({
          tags: [...new Set([...existing.tags, ...tags])],
          metadata: { ...existing.metadata, ...metadata, updated_at: now },
          status: existing.status === "unsubscribed" ? "active" : existing.status,
          updated_at: now,
        })
        .eq("id", existing.id);

      if (error) throw error;

      // Send welcome back email
      await sendWelcomeEmail(email, tags, true);

      return { success: true };
    }

    // Create new subscriber
    const { error } = await supabase.from("subscribers").insert({
      email: email.toLowerCase(),
      status: "active",
      tags,
      metadata: { ...metadata, created_at: now },
      created_at: now,
      updated_at: now,
    });

    if (error) throw error;

    // Send welcome email
    await sendWelcomeEmail(email, tags, false);

    return { success: true };
  } catch (error) {
    console.error("Supabase subscribe error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Subscription failed",
    };
  }
}

export async function sendEmailWithResend(
  to: string,
  subject: string,
  html: string,
  options?: {
    from?: string;
    replyTo?: string;
    tags?: string[];
  }
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options?.from || CONFIG.supabase.resendFrom,
        to: to.toLowerCase(),
        reply_to: options?.replyTo || CONFIG.supabase.resendReplyTo,
        subject,
        html,
        tags: options?.tags,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    // Log to database
    await logEmailSend(to, subject, data.id);

    return { success: true, id: data.id };
  } catch (error) {
    console.error("Resend error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email failed",
    };
  }
}

async function logEmailSend(to: string, subject: string, resendId: string) {
  try {
    const supabase = getSupabaseClient();
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", to.toLowerCase())
      .single();

    if (subscriber) {
      await supabase.from("email_logs").insert({
        subscriber_id: subscriber.id,
        email: to.toLowerCase(),
        subject,
        resend_id: resendId,
        status: "sent",
        sent_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Failed to log email:", error);
  }
}

async function sendWelcomeEmail(email: string, tags: string[], isReturning: boolean) {
  const { getWelcomeEmailTemplate } = await import("@/components/email/templates");
  
  const template = getWelcomeEmailTemplate({
    email,
    isReturning,
    recommendedDevice: tags.find((t) => t.startsWith("interested-"))?.replace("interested-", ""),
    quizResult: tags.find((t) => t.startsWith("result-"))?.replace("result-", ""),
  });

  await sendEmailWithResend(email, template.subject, template.html);
}

// ============================================================================
// ConvertKit Implementation
// ============================================================================

export async function subscribeWithConvertKit(
  email: string,
  tags: string[],
  metadata: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = CONFIG.convertkit.apiKey;
    const formId = CONFIG.convertkit.formId;

    if (!apiKey || !formId) {
      throw new Error("ConvertKit not configured");
    }

    // Subscribe to form
    const response = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        email: email.toLowerCase(),
        tags: tags.map((t) => t.replace(/-/g, "_")), // ConvertKit tags can't have hyphens
        fields: {
          quiz_result: metadata.quizResult as string || "",
          recommended_device: metadata.recommendedDevice as string || "",
          simulator_device: metadata.simulatorDevice as string || "",
          source_page: metadata.source as string || "",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Check if already subscribed
      if (data.message?.includes("already subscribed")) {
        // Tag them instead
        await tagSubscriberInConvertKit(email, tags);
        return { success: true };
      }
      throw new Error(data.message || "ConvertKit subscription failed");
    }

    return { success: true };
  } catch (error) {
    console.error("ConvertKit subscribe error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Subscription failed",
    };
  }
}

async function tagSubscriberInConvertKit(email: string, tags: string[]) {
  try {
    const apiKey = CONFIG.convertkit.apiKey;
    const apiSecret = CONFIG.convertkit.apiSecret;

    if (!apiKey || !apiSecret) return;

    // First, get subscriber ID
    const subscriberRes = await fetch(
      `https://api.convertkit.com/v3/subscribers?api_secret=${apiSecret}&email_address=${encodeURIComponent(email)}`
    );
    const subscriberData = await subscriberRes.json();

    if (!subscriberData.subscribers?.length) return;

    const subscriberId = subscriberData.subscribers[0].id;

    // Tag the subscriber
    for (const tag of tags) {
      await fetch(`https://api.convertkit.com/v3/tags/${tag.replace(/-/g, "_")}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          email: email.toLowerCase(),
        }),
      });
    }
  } catch (error) {
    console.error("ConvertKit tagging error:", error);
  }
}

// ============================================================================
// Unified API
// ============================================================================

export async function subscribeUser(
  email: string,
  tags: string[],
  metadata: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const provider = getEmailProvider();

  if (provider === "convertkit") {
    return subscribeWithConvertKit(email, tags, metadata);
  }

  return subscribeWithSupabase(email, tags, metadata);
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options?: { from?: string; replyTo?: string; tags?: string[] }
): Promise<{ success: boolean; error?: string; id?: string }> {
  const provider = getEmailProvider();

  if (provider === "convertkit") {
    // ConvertKit doesn't support direct email sending via API
    // You would use their broadcast feature or sequences
    throw new Error("Direct email sending not supported with ConvertKit");
  }

  return sendEmailWithResend(to, subject, html, options);
}

export async function unsubscribeUser(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const provider = getEmailProvider();

    if (provider === "supabase") {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("subscribers")
        .update({ status: "unsubscribed", updated_at: new Date().toISOString() })
        .eq("email", email.toLowerCase());

      if (error) throw error;
    } else {
      // ConvertKit - use their unsubscribe webhook or API
      const apiSecret = CONFIG.convertkit.apiSecret;
      if (apiSecret) {
        await fetch(`https://api.convertkit.com/v3/unsubscribe?api_secret=${apiSecret}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.toLowerCase() }),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unsubscribe failed",
    };
  }
}

// ============================================================================
// Stats (for admin dashboard)
// ============================================================================

export async function getSubscriberStats(): Promise<{
  total: number;
  thisWeek: number;
  topDevice: string;
  unsubscribed: number;
}> {
  try {
    const provider = getEmailProvider();

    if (provider === "supabase") {
      const supabase = getSupabaseClient();
      
      // Total subscribers
      const { count: total } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // This week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const { count: thisWeek } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo.toISOString())
        .eq("status", "active");

      // Unsubscribed
      const { count: unsubscribed } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true })
        .eq("status", "unsubscribed");

      // Top device (requires parsing tags)
      const { data: subscribers } = await supabase
        .from("subscribers")
        .select("tags")
        .eq("status", "active");

      const deviceCounts: Record<string, number> = {};
      subscribers?.forEach((sub) => {
        sub.tags.forEach((tag: string) => {
          if (tag.startsWith("interested-")) {
            const device = tag.replace("interested-", "");
            deviceCounts[device] = (deviceCounts[device] || 0) + 1;
          }
        });
      });

      const topDevice = Object.entries(deviceCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

      return {
        total: total || 0,
        thisWeek: thisWeek || 0,
        topDevice,
        unsubscribed: unsubscribed || 0,
      };
    }

    // ConvertKit - would need to fetch from their API
    return { total: 0, thisWeek: 0, topDevice: "N/A", unsubscribed: 0 };
  } catch (error) {
    console.error("Stats error:", error);
    return { total: 0, thisWeek: 0, topDevice: "Error", unsubscribed: 0 };
  }
}
