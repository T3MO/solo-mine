"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bug, GitCommit, Clock, Server, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface BuildInfo {
  timestamp: string;
  commit: string;
  branch: string;
  nodeEnv: string;
  nextVersion: string;
}

interface EnvCheck {
  name: string;
  value: string | undefined;
  required: boolean;
  status: "ok" | "warning" | "error";
}

// ============================================================================
// Component
// ============================================================================

export function BuildInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const [envChecks, setEnvChecks] = useState<EnvCheck[]>([]);

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  useEffect(() => {
    // Gather build info
    setBuildInfo({
      timestamp: new Date().toISOString(),
      commit: process.env.NEXT_PUBLIC_GIT_COMMIT || "dev",
      branch: process.env.NEXT_PUBLIC_GIT_BRANCH || "main",
      nodeEnv: process.env.NODE_ENV,
      nextVersion: process.env.NEXT_PUBLIC_NEXT_VERSION || "unknown",
    });

    // Check environment variables
    const checks: EnvCheck[] = [
      {
        name: "NEXT_PUBLIC_SITE_URL",
        value: process.env.NEXT_PUBLIC_SITE_URL,
        required: true,
        status: process.env.NEXT_PUBLIC_SITE_URL ? "ok" : "error",
      },
      {
        name: "NEXT_PUBLIC_PLAUSIBLE_DOMAIN",
        value: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
        required: false,
        status: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? "ok" : "warning",
      },
      {
        name: "NEXT_PUBLIC_GOOGLE_VERIFICATION",
        value: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
        required: false,
        status: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ? "ok" : "warning",
      },
    ];
    setEnvChecks(checks);

    // Console warning if analytics not configured
    if (!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
      console.warn(
        "%c[Build Info] %cAnalytics not configured",
        "color: #FF6B00; font-weight: bold;",
        "color: #FFA500;"
      );
      console.info(
        "%c[Build Info] %cSet NEXT_PUBLIC_PLAUSIBLE_DOMAIN for production analytics",
        "color: #FF6B00; font-weight: bold;",
        "color: #888;"
      );
    }
  }, []);

  // Keyboard shortcut to toggle (Ctrl/Cmd + Shift + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getStatusIcon = (status: EnvCheck["status"]) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
        title="Debug Info (Ctrl+Shift+D)"
      >
        <Bug className="w-5 h-5" />
      </motion.button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed bottom-4 left-4 z-50 w-80 bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Build Info</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Build Info */}
                {buildInfo && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Build
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Built:</span>
                        <span>{new Date(buildInfo.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitCommit className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Commit:</span>
                        <code className="px-1.5 py-0.5 rounded bg-muted text-xs">
                          {buildInfo.commit.slice(0, 7)}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Server className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Env:</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-xs",
                          buildInfo.nodeEnv === "development"
                            ? "bg-amber-500/20 text-amber-600"
                            : "bg-accent/20 text-accent"
                        )}>
                          {buildInfo.nodeEnv}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Environment Checks */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Environment Variables
                  </h4>
                  <div className="space-y-2">
                    {envChecks.map((check) => (
                      <div
                        key={check.name}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(check.status)}
                          <span className="text-xs font-mono">{check.name}</span>
                        </div>
                        <span className={cn(
                          "text-xs",
                          check.value ? "text-accent" : "text-muted-foreground"
                        )}>
                          {check.value ? "Set" : check.required ? "Required" : "Optional"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shortcuts */}
                <div className="pt-2 border-t border-border">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Shortcuts
                  </h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Toggle Debug</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">Ctrl+Shift+D</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Search</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">Ctrl+K</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
