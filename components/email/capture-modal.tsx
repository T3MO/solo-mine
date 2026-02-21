"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Check, Loader2, Shield, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";

// ============================================================================
// Types
// ============================================================================

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: "quiz-complete" | "simulator-3-runs" | "exit-intent" | "hardware-viewed" | "manual";
  quizResult?: {
    type: string;
    recommendedDevice?: string;
    compatibility?: number;
  };
  simulatorConfig?: {
    device: string;
    electricityRate: number;
    mode: "pool" | "solo";
  };
  delay?: number;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

// ============================================================================
// Component
// ============================================================================

export function CaptureModal({
  isOpen,
  onClose,
  trigger,
  quizResult,
  simulatorConfig,
  delay = 500,
}: CaptureModalProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // Anti-spam
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { progress } = useProgress();

  // Delayed open for better UX
  useEffect(() => {
    if (isOpen && !showModal) {
      const timer = setTimeout(() => setShowModal(true), delay);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      setShowModal(false);
    }
  }, [isOpen, delay]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setEmail("");
        setConsent(false);
        setSubmitState("idle");
        setErrorMessage("");
      }, 300);
    }
  }, [isOpen]);

  // Get personalized headline based on trigger
  const getHeadline = () => {
    switch (trigger) {
      case "quiz-complete":
        return "Get Your Mining Assessment";
      case "simulator-3-runs":
        return "Save Your Calculations";
      case "exit-intent":
        return "Don't Lose Your Progress";
      case "hardware-viewed":
        return "Get Price Drop Alerts";
      default:
        return "Join 2,000+ Home Miners";
    }
  };

  // Get personalized benefits
  const getBenefits = () => {
    const baseBenefits = [
      "Personalized hardware recommendations",
      "Current profitability calculations (updated weekly)",
      "Price drop alerts for recommended devices",
    ];

    if (trigger === "quiz-complete" && quizResult?.recommendedDevice) {
      return [
        `Detailed analysis of the ${quizResult.recommendedDevice}`,
        "Weekly profitability updates for your setup",
        "Price drop alerts + stock notifications",
        "Setup guide when you're ready to buy",
      ];
    }

    if (trigger === "simulator-3-runs" && simulatorConfig) {
      return [
        "Your saved simulation results",
        "Weekly profitability recalculation",
        "Alerts when your config becomes profitable",
        "Price tracking for your chosen device",
      ];
    }

    return baseBenefits;
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Handle submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check (bots fill this, humans don't)
    if (honeypot) {
      console.log("Honeypot triggered - likely bot");
      setSubmitState("success"); // Fake success to avoid revealing detection
      setTimeout(onClose, 1500);
      return;
    }

    // Validation
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      setSubmitState("error");
      return;
    }

    if (!consent) {
      setErrorMessage("Please agree to receive mining tips and alerts");
      setSubmitState("error");
      return;
    }

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: trigger,
          tags: buildTags(),
          metadata: {
            quizResult: quizResult?.type,
            recommendedDevice: quizResult?.recommendedDevice,
            simulatorDevice: simulatorConfig?.device,
            simulatorMode: simulatorConfig?.mode,
            electricityRate: simulatorConfig?.electricityRate,
            userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
            referrer: typeof window !== "undefined" ? document.referrer : undefined,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      // Mark as captured in localStorage
      localStorage.setItem("solo-mine-email-captured", "true");
      localStorage.setItem("solo-mine-capture-date", Date.now().toString());

      setSubmitState("success");

      // Close after showing success
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error) {
      console.error("Subscribe error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setSubmitState("error");
    }
  }, [email, consent, honeypot, trigger, quizResult, simulatorConfig, onClose]);

  // Build tags based on context
  const buildTags = (): string[] => {
    const tags: string[] = [trigger];

    if (quizResult?.type) {
      tags.push(`result-${quizResult.type}`);
    }

    if (quizResult?.recommendedDevice) {
      tags.push(`interested-${quizResult.recommendedDevice}`);
    }

    if (simulatorConfig?.device) {
      tags.push(`simulated-${simulatorConfig.device}`);
    }

    if (simulatorConfig?.mode) {
      tags.push(`mode-${simulatorConfig.mode}`);
    }

    return tags;
  };

  return (
    <AnimatePresence>
      {showModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="relative bg-background border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden">
              {/* Orange glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="relative p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {submitState === "success" ? (
                    // Success State
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6"
                      >
                        <Check className="w-10 h-10 text-accent" />
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-2">Check Your Inbox!</h3>
                      <p className="text-muted-foreground">
                        We've sent your personalized mining assessment to{" "}
                        <span className="text-foreground font-medium">{email}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-4">
                        (Don't forget to check your spam folder)
                      </p>
                    </motion.div>
                  ) : (
                    // Form State
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Header */}
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                          <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{getHeadline()}</h2>
                        <p className="text-muted-foreground text-sm">
                          We'll email you:
                        </p>
                      </div>

                      {/* Benefits */}
                      <ul className="space-y-2 mb-6">
                        {getBenefits().map((benefit, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{benefit}</span>
                          </motion.li>
                        ))}
                      </ul>

                      {/* Form */}
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Honeypot field - hidden from humans */}
                        <input
                          type="text"
                          name="website"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                          style={{
                            position: "absolute",
                            opacity: 0,
                            pointerEvents: "none",
                            left: "-9999px",
                          }}
                          aria-hidden="true"
                        />

                        {/* Email Input */}
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (submitState === "error") setSubmitState("idle");
                            }}
                            className={cn(
                              "pl-10 h-12",
                              submitState === "error" && !validateEmail(email) && "border-destructive"
                            )}
                            autoComplete="email"
                            inputMode="email"
                            disabled={submitState === "submitting"}
                            autoFocus
                          />
                        </div>

                        {/* Consent Checkbox */}
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="consent"
                            checked={consent}
                            onCheckedChange={(checked) => setConsent(checked as boolean)}
                            className="mt-0.5"
                          />
                          <label
                            htmlFor="consent"
                            className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                          >
                            I want to receive mining tips, price alerts, and setup guides.
                            1-2 emails per week. Unsubscribe anytime.
                          </label>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive"
                          >
                            {errorMessage}
                          </motion.p>
                        )}

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold"
                          disabled={submitState === "submitting" || !consent}
                        >
                          {submitState === "submitting" ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send My Assessment"
                          )}
                        </Button>

                        {/* Privacy Note */}
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Shield className="w-3 h-3" />
                          <span>No spam. Unsubscribe anytime. We don't share your email.</span>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Inline Capture Button (for "Email my configuration")
// ============================================================================

interface CaptureButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
  onClick: () => void;
}

export function CaptureButton({
  variant = "outline",
  size = "default",
  className,
  children,
  onClick,
}: CaptureButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn("gap-2", className)}
    >
      <Mail className="w-4 h-4" />
      {children || "Email My Results"}
    </Button>
  );
}
