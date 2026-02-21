"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, MousePointer, Mail, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface SubscriberStats {
  total: number;
  thisWeek: number;
  topDevice: string;
  unsubscribed: number;
}

// ============================================================================
// Component
// ============================================================================

export function EmailStatsWidget() {
  const [stats, setStats] = useState<SubscriberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only show in development mode
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isDev) return;
    fetchStats();
  }, [isDev]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/stats", {
        headers: {
          // In production, you'd use proper auth
          authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_KEY || "dev"}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Don't render in production
  if (!isDev) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 w-80"
    >
      <Card className="border-primary/30 shadow-lg shadow-primary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Email Stats
            <span className="text-xs text-muted-foreground font-normal">(Dev Only)</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : !stats ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Total Subscribers */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total</span>
                </div>
                <span className="text-2xl font-bold">{stats.total.toLocaleString()}</span>
              </div>

              {/* This Week */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">This Week</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">+{stats.thisWeek}</span>
                  {stats.total > 0 && (
                    <span className="text-xs text-accent">
                      ({((stats.thisWeek / stats.total) * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Top Device */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Top Device</span>
                </div>
                <span className="text-sm font-medium text-right truncate max-w-[120px]">
                  {stats.topDevice === "None" ? "-" : stats.topDevice}
                </span>
              </div>

              {/* Unsubscribed */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">Unsubscribed</span>
                <span className="text-xs text-destructive">{stats.unsubscribed}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
