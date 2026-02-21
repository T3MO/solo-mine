"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBitcoinData } from "@/hooks/useLiveProfitability";

// ============================================================================
// Types
// ============================================================================

type AlertType = "price-pump" | "price-drop" | "difficulty-drop" | "halving-approach";

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
  dismissible: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function PriceAlertBanner() {
  const { data } = useBitcoinData(60000);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Load dismissed alerts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("solo-mine-dismissed-alerts");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only keep alerts dismissed in last 24 hours
      const recent = parsed.filter((item: { id: string; time: number }) => 
        Date.now() - item.time < 24 * 60 * 60 * 1000
      );
      setDismissedAlerts(recent.map((item: { id: string }) => item.id));
    }
  }, []);

  // Generate alerts based on market conditions
  useEffect(() => {
    if (!data) return;

    const newAlerts: Alert[] = [];

    // Price pump alert (>10% in 24h)
    if (data.price.change24h > 10) {
      newAlerts.push({
        id: `price-pump-${Math.floor(Date.now() / (24 * 60 * 60 * 1000))}`, // Daily ID
        type: "price-pump",
        title: "Bitcoin is Pumping! 🚀",
        message: `BTC is up ${data.price.change24h.toFixed(1)}% in 24h. Your miner just got more profitable.`,
        action: {
          label: "Check Profitability",
          href: "/tools/variance-simulator",
        },
        dismissible: true,
      });
    }

    // Price drop alert (<-10% in 24h)
    if (data.price.change24h < -10) {
      newAlerts.push({
        id: `price-drop-${Math.floor(Date.now() / (24 * 60 * 60 * 1000))}`,
        type: "price-drop",
        title: "Bitcoin Price Drop",
        message: `BTC is down ${Math.abs(data.price.change24h).toFixed(1)}% in 24h. Might be a good buying opportunity.`,
        action: {
          label: "View Hardware",
          href: "/hardware",
        },
        dismissible: true,
      });
    }

    // Difficulty drop alert
    if (data.network.difficultyChange < -2) {
      newAlerts.push({
        id: `difficulty-drop-${Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))}`, // Weekly ID
        type: "difficulty-drop",
        title: "Mining Got Easier ⛏️",
        message: `Difficulty dropping ${Math.abs(data.network.difficultyChange).toFixed(1)}%. Less competition = more rewards for you.`,
        action: {
          label: "Run Simulator",
          href: "/tools/variance-simulator",
        },
        dismissible: true,
      });
    }

    // Halving approaching (within 60 days)
    const halvingDate = new Date(data.economics.nextHalving.estimatedDate);
    const daysToHalving = Math.ceil((halvingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysToHalving <= 60 && daysToHalving > 0) {
      newAlerts.push({
        id: `halving-${Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))}`,
        type: "halving-approach",
        title: "Halving Approaching ⚡",
        message: `Only ${daysToHalving} days until the reward halves. Supply shock typically follows.`,
        action: {
          label: "Learn More",
          href: "/learn/halving",
        },
        dismissible: true,
      });
    }

    // Filter out dismissed alerts
    const activeAlerts = newAlerts.filter(alert => !dismissedAlerts.includes(alert.id));
    setAlerts(activeAlerts);
  }, [data, dismissedAlerts]);

  const dismissAlert = (id: string) => {
    // Add to dismissed list
    const newDismissed = [...dismissedAlerts, id];
    setDismissedAlerts(newDismissed);
    
    // Store with timestamp
    const toStore = newDismissed.map(id => ({ id, time: Date.now() }));
    localStorage.setItem("solo-mine-dismissed-alerts", JSON.stringify(toStore));
    
    // Remove from active alerts
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (!alerts.length) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-2 p-2">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "mx-auto max-w-4xl rounded-lg border p-4 shadow-lg",
              "flex items-center justify-between gap-4",
              alert.type === "price-pump" && "bg-accent/10 border-accent/30",
              alert.type === "price-drop" && "bg-destructive/10 border-destructive/30",
              alert.type === "difficulty-drop" && "bg-primary/10 border-primary/30",
              alert.type === "halving-approach" && "bg-secondary/10 border-secondary/30"
            )}
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                alert.type === "price-pump" && "bg-accent/20",
                alert.type === "price-drop" && "bg-destructive/20",
                alert.type === "difficulty-drop" && "bg-primary/20",
                alert.type === "halving-approach" && "bg-secondary/20"
              )}>
                {alert.type === "price-pump" && <TrendingUp className="w-5 h-5 text-accent" />}
                {alert.type === "price-drop" && <TrendingDown className="w-5 h-5 text-destructive" />}
                {alert.type === "difficulty-drop" && <AlertTriangle className="w-5 h-5 text-primary" />}
                {alert.type === "halving-approach" && <Clock className="w-5 h-5 text-secondary" />}
              </div>

              {/* Content */}
              <div>
                <h4 className={cn(
                  "font-semibold",
                  alert.type === "price-pump" && "text-accent",
                  alert.type === "price-drop" && "text-destructive",
                  alert.type === "difficulty-drop" && "text-primary",
                  alert.type === "halving-approach" && "text-secondary"
                )}>
                  {alert.title}
                </h4>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {alert.action && (
                <Button
                  size="sm"
                  variant={alert.type === "price-drop" ? "destructive" : "default"}
                  className={cn(
                    alert.type === "price-pump" && "bg-accent hover:bg-accent/90",
                    alert.type === "difficulty-drop" && "bg-primary hover:bg-primary/90",
                    alert.type === "halving-approach" && "bg-secondary hover:bg-secondary/90"
                  )}
                  asChild
                >
                  <a href={alert.action.href}>{alert.action.label}</a>
                </Button>
              )}
              
              {alert.dismissible && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
