"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRecommendedFees, useNetworkStats, getFeeRecommendation } from "@/lib/bitcoin-api";

// ============================================================================
// Types
// ============================================================================

interface FeeOption {
  label: string;
  fee: number;
  time: string;
  description: string;
}

// ============================================================================
// Fee History Chart (simulated)
// ============================================================================

function FeeHistoryChart() {
  // Simulated 24h fee history - in production, fetch from API
  const history = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const baseFee = 20;
      const variation = Math.sin(i / 3) * 15 + Math.random() * 10;
      return Math.max(5, Math.round(baseFee + variation));
    });
  }, []);

  const maxFee = Math.max(...history);
  const minFee = Math.min(...history);
  const avgFee = Math.round(history.reduce((a, b) => a + b, 0) / history.length);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-1 h-24">
        {history.map((fee, i) => {
          const height = ((fee - minFee) / (maxFee - minFee || 1)) * 100;
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(10, height)}%` }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                "flex-1 rounded-t transition-colors",
                fee > 50 ? "bg-destructive/60" :
                fee > 30 ? "bg-amber-500/60" :
                "bg-accent/60"
              )}
              title={`${i}:00 - ${fee} sat/vB`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>24h ago</span>
        <span>Now</span>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function MempoolFeeEstimator() {
  const { data: fees, loading: feesLoading } = useRecommendedFees(30000); // 30s refresh
  const { data: network, loading: networkLoading } = useNetworkStats(30000);
  const [selectedFee, setSelectedFee] = useState<"fastest" | "halfHour" | "hour" | "economy">("halfHour");

  const isLoading = feesLoading || networkLoading;

  const feeOptions: FeeOption[] = useMemo(() => {
    if (!fees) return [];

    return [
      {
        label: "Fastest",
        fee: fees.fastestFee,
        time: "~10 min",
        description: "Next block confirmation",
      },
      {
        label: "Standard",
        fee: fees.halfHourFee,
        time: "~30 min",
        description: "3-6 block confirmation",
      },
      {
        label: "Slow",
        fee: fees.hourFee,
        time: "~1 hour",
        description: "6+ block confirmation",
      },
      {
        label: "Economy",
        fee: fees.economyFee,
        time: "~few hours",
        description: "When mempool clears",
      },
    ];
  }, [fees]);

  if (isLoading || !fees || !network) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-24 bg-muted rounded" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recommendation = getFeeRecommendation(network.congestionLevel);
  const selectedOption = feeOptions.find((_, i) => 
    ["fastest", "halfHour", "hour", "economy"][i] === selectedFee
  );

  // Calculate transaction sizes
  const typicalTxSize = 140; // vBytes for typical 1-input, 2-output transaction
  const selectedCost = selectedOption ? (selectedOption.fee * typicalTxSize) / 1e8 : 0; // BTC
  const selectedCostUsd = selectedCost * (network?.congestionLevel ? 65000 : 0); // Rough USD estimate

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Transaction Fee Estimator
            </CardTitle>
            <CardDescription>
              When should you transact?
            </CardDescription>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            network.congestionLevel === "critical" ? "bg-destructive/20 text-destructive" :
            network.congestionLevel === "high" ? "bg-amber-500/20 text-amber-500" :
            network.congestionLevel === "medium" ? "bg-yellow-500/20 text-yellow-500" :
            "bg-accent/20 text-accent"
          )}>
            {network.congestionLevel.toUpperCase()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recommendation */}
        <div className={cn(
          "p-4 rounded-lg flex items-start gap-3",
          network.congestionLevel === "critical" ? "bg-destructive/10" :
          network.congestionLevel === "high" ? "bg-amber-500/10" :
          "bg-accent/10"
        )}>
          <AlertTriangle className={cn(
            "w-5 h-5 flex-shrink-0 mt-0.5",
            network.congestionLevel === "critical" ? "text-destructive" :
            network.congestionLevel === "high" ? "text-amber-500" :
            "text-accent"
          )} />
          <div>
            <p className="font-medium">{recommendation}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Mempool: {network.mempoolSize} MB ({network.mempoolTxs.toLocaleString()} transactions waiting)
            </p>
          </div>
        </div>

        {/* Fee Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {feeOptions.map((option, index) => {
            const key = ["fastest", "halfHour", "hour", "economy"][index] as typeof selectedFee;
            const isSelected = selectedFee === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedFee(key)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border bg-muted/50 hover:border-primary/50"
                )}
              >
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {option.label}
                </div>
                <div className="text-2xl font-bold font-mono">
                  {option.fee}
                </div>
                <div className="text-xs text-muted-foreground">sat/vB</div>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <Clock className="w-3 h-3" />
                  {option.time}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Fee Details */}
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-muted/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Typical transaction cost:</span>
              <span className="text-lg font-bold">{selectedCost.toFixed(6)} BTC</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">~${selectedCostUsd.toFixed(2)} USD</span>
              <span className="text-xs text-muted-foreground">({typicalTxSize} vBytes)</span>
            </div>
          </motion.div>
        )}

        {/* Fee History */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            24-Hour Fee History
          </h4>
          <FeeHistoryChart />
          <p className="text-xs text-muted-foreground mt-2">
            Fees typically spike during US business hours and drop during weekends.
          </p>
        </div>

        {/* Tips */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">💡 Pro Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use Replace-By-Fee (RBF) to bump fees if stuck</li>
            <li>• Batch multiple payments into one transaction</li>
            <li>• Wait for weekends when fees typically drop 30-50%</li>
            <li>• Use Lightning Network for instant, cheap payments</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Compact Version (for inline use)
// ============================================================================

export function CompactMempoolFee() {
  const { data: fees, loading } = useRecommendedFees(60000);

  if (loading || !fees) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Loading fees...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <Zap className="w-4 h-4 text-primary" />
        <span className="font-mono font-medium">{fees.halfHourFee} sat/vB</span>
        <span className="text-muted-foreground">(~30 min)</span>
      </div>
    </div>
  );
}
