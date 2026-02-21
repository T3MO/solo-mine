"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================================================
// Error Page Props
// ============================================================================

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ============================================================================
// Main Error Boundary
// ============================================================================

export default function ErrorBoundary({ error, reset }: ErrorPageProps) {
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    // Log error to console
    console.error("[Error Boundary]", error);

    // Send to analytics if available
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("Error", {
        props: {
          message: error.message,
          digest: error.digest || "unknown",
          stack: isDev ? (error.stack || "No stack trace") : "hidden",
        },
      });
    }
  }, [error, isDev]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-[150px]" />
        
        {/* Animated warning stripes */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-full h-2 bg-destructive"
              style={{ top: `${i * 10}%` }}
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <Card className="border-destructive/30 overflow-hidden">
          {/* Header */}
          <CardHeader className="text-center border-b border-border/50 bg-destructive/5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4"
            >
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </motion.div>
            <CardTitle className="text-2xl font-mono tracking-wider">
              MINING RIG MALFUNCTION
            </CardTitle>
            <CardDescription>
              Something went wrong while processing your request
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Error Code */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Error Code</p>
              <code className="inline-block px-4 py-2 rounded-lg bg-muted font-mono text-sm">
                {error.digest || "UNKNOWN_ERROR"}
              </code>
            </div>

            {/* Error Message (dev only) */}
            {isDev && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bug className="w-4 h-4" />
                  <span>Development Mode - Error Details</span>
                </div>
                <div className="p-4 rounded-lg bg-muted overflow-auto max-h-48">
                  <p className="text-sm font-mono text-destructive mb-2">{error.message}</p>
                  {error.stack && (
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={reset}
                className="flex-1 gap-2"
                size="lg"
              >
                <RefreshCw className="w-4 h-4" />
                Restart System
              </Button>
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  <Home className="w-4 h-4" />
                  Return to Safety
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <p className="text-center text-sm text-muted-foreground">
              If this error persists, please{" "}
              <a
                href="mailto:support@solomine.io?subject=Error%20Report"
                className="text-primary hover:underline"
              >
                contact support
              </a>{" "}
              with the error code above.
            </p>
          </CardContent>
        </Card>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-4 px-4 py-2 rounded-full bg-muted/50 text-sm">
            <span className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                error.digest ? "bg-destructive" : "bg-amber-500"
              )} />
              System Status
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">
              {error.digest ? "Critical Failure" : "Recoverable Error"}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
