"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// ============================================================================
// Unsubscribe Form Component
// ============================================================================

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email");
  const type = searchParams.get("type");

  const [email, setEmail] = useState(urlEmail || "");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          type: type || "all",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("You have been successfully unsubscribed. You will no longer receive emails from us.");
      } else {
        throw new Error(data.error || "Failed to unsubscribe");
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className={status === "success" ? "border-accent/50" : ""}>
          <CardHeader className="text-center">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
              ${status === "success" ? "bg-accent/20" : "bg-muted"}
            `}>
              {status === "success" ? (
                <Check className="w-8 h-8 text-accent" />
              ) : status === "error" ? (
                <AlertTriangle className="w-8 h-8 text-destructive" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted-foreground/20" />
              )}
            </div>
            <CardTitle>
              {status === "success" ? "Unsubscribed" : "Unsubscribe"}
            </CardTitle>
            <CardDescription>
              {status === "success" 
                ? "We're sorry to see you go"
                : "Enter your email to unsubscribe from our emails"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {status === "success" ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">{message}</p>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                  Return to Home
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "submitting"}
                    className="h-12"
                    autoComplete="email"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-destructive">{message}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Unsubscribe"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You can also email us at{" "}
                  <a href="mailto:privacy@solomine.io" className="text-primary hover:underline">
                    privacy@solomine.io
                  </a>{" "}
                  to request removal.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Main Page with Suspense
// ============================================================================

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <UnsubscribeForm />
    </Suspense>
  );
}
