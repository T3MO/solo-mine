"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// ============================================================================
// Types
// ============================================================================

type PlausibleEvent =
  | "pageview"
  | "Quiz Started"
  | "Quiz Completed"
  | "Simulation Run"
  | "Hardware Viewed"
  | "Affiliate Click"
  | "Block Found"
  | "404"
  | "Error";

interface PlausibleProps {
  domain: string;
  customDomain?: string;
}

// ============================================================================
// Plausible Script Component
// ============================================================================

function PlausibleScript({ domain, customDomain }: PlausibleProps) {
  const src = customDomain 
    ? `${customDomain}/js/script.outbound-links.tagged-events.js`
    : "https://plausible.io/js/script.outbound-links.tagged-events.js";

  return (
    <Script
      strategy="afterInteractive"
      data-domain={domain}
      src={src}
      data-api={customDomain ? `${customDomain}/api/event` : undefined}
    />
  );
}

// ============================================================================
// Page View Tracker
// ============================================================================

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && window.plausible) {
      // Track page view with URL
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      window.plausible("pageview", { props: { url } });
    }
  }, [pathname, searchParams]);

  return null;
}

// ============================================================================
// Main Analytics Component
// ============================================================================

export function PlausibleAnalytics({ domain, customDomain }: PlausibleProps) {
  // Don't render in development unless explicitly enabled
  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PLAUSIBLE_DEV) {
    return null;
  }

  return (
    <>
      <PlausibleScript domain={domain} customDomain={customDomain} />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

// ============================================================================
// Event Tracking Helpers
// ============================================================================

/**
 * Track a custom event with Plausible
 */
export function trackEvent(
  event: PlausibleEvent,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(event, { props });
  }
}

/**
 * Track quiz completion with result
 */
export function trackQuizCompleted(resultType: string, compatibility: number) {
  trackEvent("Quiz Completed", {
    result: resultType,
    compatibility: Math.round(compatibility),
  });
}

/**
 * Track simulation run with parameters
 */
export function trackSimulationRun(
  mode: "pool" | "solo",
  device: string,
  electricityRate: number
) {
  trackEvent("Simulation Run", {
    mode,
    device,
    electricity_rate: electricityRate,
  });
}

/**
 * Track hardware device view
 */
export function trackHardwareViewed(deviceId: string, deviceName: string) {
  trackEvent("Hardware Viewed", {
    device_id: deviceId,
    device_name: deviceName,
  });
}

/**
 * Track affiliate link click
 */
export function trackAffiliateClick(destination: string, deviceName?: string) {
  trackEvent("Affiliate Click", {
    destination,
    device: deviceName || "unknown",
  });
}

/**
 * Track block found in SHA-256 visualizer
 */
export function trackBlockFound(difficulty: number) {
  trackEvent("Block Found", {
    difficulty,
  });
}

/**
 * Track quiz start
 */
export function trackQuizStarted() {
  trackEvent("Quiz Started");
}

/**
 * Hook for tracking component mount events
 */
export function useTrackEvent(event: PlausibleEvent, props?: Record<string, string | number | boolean>) {
  useEffect(() => {
    trackEvent(event, props);
  }, [event, props]);
}
