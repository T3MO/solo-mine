"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// ============================================================================
// Types
// ============================================================================

interface UseEmailCaptureOptions {
  trigger: "quiz-complete" | "simulator-3-runs" | "exit-intent" | "hardware-viewed" | "manual";
  delay?: number;
  cooldown?: number; // ms between showing captures
  maxShows?: number;
}

interface UseEmailCaptureReturn {
  showCapture: boolean;
  setShowCapture: (show: boolean) => void;
  hasCaptured: boolean;
  submitEmail: (email: string, tags: string[], metadata: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  triggerCapture: () => void;
}

// ============================================================================
// Local Storage Helpers
// ============================================================================

const STORAGE_KEY = "solo-mine-email-capture";

interface CaptureState {
  hasCaptured: boolean;
  captureCount: number;
  lastShownAt: number | null;
  captureDate: number | null;
}

function getStoredState(): CaptureState {
  if (typeof window === "undefined") {
    return { hasCaptured: false, captureCount: 0, lastShownAt: null, captureDate: null };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }

  return { hasCaptured: false, captureCount: 0, lastShownAt: null, captureDate: null };
}

function setStoredState(state: CaptureState) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// Hook
// ============================================================================

export function useEmailCapture(options: UseEmailCaptureOptions): UseEmailCaptureReturn {
  const { trigger, delay = 3000, cooldown = 24 * 60 * 60 * 1000, maxShows = 3 } = options;
  
  const [showCapture, setShowCapture] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedState, setStoredStateState] = useState<CaptureState>(getStoredState());
  
  const hasTriggered = useRef(false);

  // Check if already captured
  const hasCaptured = storedState.hasCaptured;

  // Update stored state helper
  const updateStoredState = useCallback((updates: Partial<CaptureState>) => {
    const newState = { ...storedState, ...updates };
    setStoredState(newState);
    setStoredStateState(newState);
  }, [storedState]);

  // Trigger capture (respects cooldown and maxShows)
  const triggerCapture = useCallback(() => {
    if (hasCaptured) return;
    if (hasTriggered.current) return;
    
    const now = Date.now();
    
    // Check cooldown
    if (storedState.lastShownAt && now - storedState.lastShownAt < cooldown) {
      return;
    }
    
    // Check max shows
    if (storedState.captureCount >= maxShows) {
      return;
    }
    
    hasTriggered.current = true;
    
    // Show after delay
    setTimeout(() => {
      setShowCapture(true);
      updateStoredState({
        captureCount: storedState.captureCount + 1,
        lastShownAt: now,
      });
    }, delay);
  }, [hasCaptured, cooldown, maxShows, delay, storedState, updateStoredState]);

  // Auto-trigger on mount for certain triggers
  useEffect(() => {
    if (trigger === "quiz-complete" || trigger === "manual") {
      triggerCapture();
    }
  }, [trigger, triggerCapture]);

  // Exit intent detection
  useEffect(() => {
    if (trigger !== "exit-intent") return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10) { // Cursor near top of page
        triggerCapture();
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [trigger, triggerCapture]);

  // Submit email
  const submitEmail = useCallback(async (
    email: string,
    tags: string[],
    metadata: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string }> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: trigger,
          tags,
          metadata: {
            ...metadata,
            capturedVia: trigger,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setIsSuccess(true);
      updateStoredState({
        hasCaptured: true,
        captureDate: Date.now(),
      });

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Subscription failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  }, [trigger, updateStoredState]);

  return {
    showCapture,
    setShowCapture,
    hasCaptured,
    submitEmail,
    isSubmitting,
    isSuccess,
    error,
    triggerCapture,
  };
}

// ============================================================================
// Convenience Hook for Specific Triggers
// ============================================================================

export function useQuizCapture(quizResult?: { type: string; recommendedDevice?: string }) {
  const capture = useEmailCapture({
    trigger: "quiz-complete",
    delay: 500, // Show quickly after quiz
  });

  return {
    ...capture,
    modalProps: {
      isOpen: capture.showCapture,
      onClose: () => capture.setShowCapture(false),
      trigger: "quiz-complete" as const,
      quizResult: quizResult ? {
        type: quizResult.type,
        recommendedDevice: quizResult.recommendedDevice,
      } : undefined,
    },
  };
}

export function useSimulatorCapture(simulatorConfig?: { device: string; electricityRate: number; mode: "pool" | "solo" }) {
  const [runCount, setRunCount] = useState(0);
  
  const capture = useEmailCapture({
    trigger: "simulator-3-runs",
    delay: 1000,
  });

  const incrementRunCount = useCallback(() => {
    setRunCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3 && !capture.hasCaptured) {
        capture.triggerCapture();
      }
      return newCount;
    });
  }, [capture]);

  return {
    ...capture,
    runCount,
    incrementRunCount,
    modalProps: {
      isOpen: capture.showCapture,
      onClose: () => capture.setShowCapture(false),
      trigger: "simulator-3-runs" as const,
      simulatorConfig,
    },
  };
}

export function useExitIntentCapture() {
  const capture = useEmailCapture({
    trigger: "exit-intent",
    delay: 0, // Immediate on exit intent
    cooldown: 7 * 24 * 60 * 60 * 1000, // 1 week cooldown
  });

  return {
    ...capture,
    modalProps: {
      isOpen: capture.showCapture,
      onClose: () => capture.setShowCapture(false),
      trigger: "exit-intent" as const,
    },
  };
}
