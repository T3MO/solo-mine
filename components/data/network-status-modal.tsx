"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Clock, Database, Activity, Zap, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { UnifiedBitcoinData } from "@/lib/bitcoin-api";

// ============================================================================
// Types
// ============================================================================

interface NetworkStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: UnifiedBitcoinData | null;
}

// ============================================================================
// Simple Sparkline Chart Component
// ============================================================================

function Sparkline({ 
  data, 
  color = "#FF6B00",
  height = 60 
}: { 
  data: number[]; 
  color?: string;
  height?: number;
}) {
  if (!data.length) return <div className="h-[60px] bg-muted animate-pulse rounded" />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
      {/* Area fill */}
      <polygon
        fill={color}
        fillOpacity="0.1"
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
}

// ============================================================================
// Mempool Bar Chart
// ============================================================================

function MempoolChart({ 
  congestionLevel 
}: { 
  congestionLevel: UnifiedBitcoinData["network"]["congestionLevel"];
}) {
  const bars = [
    { label: "Low", height: 20, color: "bg-accent" },
    { label: "Medium", height: 40, color: "bg-yellow-500" },
    { label: "High", height: 70, color: "bg-orange-500" },
    { label: "Critical", height: 95, color: "bg-destructive" },
  ];

  const activeIndex = congestionLevel === "low" ? 0 :
                      congestionLevel === "medium" ? 1 :
                      congestionLevel === "high" ? 2 : 3;

  return (
    <div className="flex items-end gap-2 h-24">
      {bars.map((bar, index) => (
        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${bar.height}%` }}
            className={cn(
              "w-full rounded-t transition-all duration-500",
              bar.color,
              index === activeIndex ? "opacity-100" : "opacity-30"
            )}
          />
          <span className={cn(
            "text-xs",
            index === activeIndex ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Halving Countdown Component
// ============================================================================

function HalvingCountdown({ data }: { data: UnifiedBitcoinData }) {
  const { nextHalving } = data.economics;
  const progress = ((210000 - nextHalving.blocksRemaining) / 210000) * 100;

  // Format estimated date
  const estimatedDate = new Date(nextHalving.estimatedDate);
  const formattedDate = estimatedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Next Halving</span>
        <span className="font-mono">Block {nextHalving.blockHeight.toLocaleString()}</span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold font-mono">
          {nextHalving.blocksRemaining.toLocaleString()}
          <span className="text-sm text-muted-foreground font-normal ml-1">blocks</span>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>~{formattedDate}</div>
          <div className="text-xs">Estimated</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Modal Component
// ============================================================================

export function NetworkStatusModal({ isOpen, onClose, data }: NetworkStatusModalProps) {
  const [priceHistory, setPriceHistory] = useState<number[]>([]);

  // Simulate price history (in production, fetch from API)
  useEffect(() => {
    if (data?.price.usd) {
      setPriceHistory(prev => {
        const newHistory = [...prev, data.price.usd];
        return newHistory.slice(-24); // Keep last 24 data points
      });
    }
  }, [data?.price.usd]);

  if (!data) return null;

  const { price, network, fees, economics } = data;

  // Format helpers
  const formatPrice = (p: number) => 
    new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(p);

  const formatHashrate = (hr: number) => {
    if (hr >= 1000) return `${(hr / 1000).toFixed(2)} ZH/s`;
    return `${hr.toFixed(1)} EH/s`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 overflow-auto"
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="w-6 h-6 text-primary" />
                    Network Status
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last updated: {formatTimeAgo(price.lastUpdated)}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Price Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Bitcoin Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-4xl font-bold font-mono">
                          {formatPrice(price.usd)}
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          price.change24h >= 0 ? "text-accent" : "text-destructive"
                        )}>
                          {price.change24h >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-medium">
                            {price.change24h >= 0 ? "+" : ""}{price.change24h.toFixed(2)}%
                          </span>
                          <span className="text-muted-foreground">(24h)</span>
                        </div>
                      </div>
                    </div>
                    <Sparkline 
                      data={priceHistory.length > 1 ? priceHistory : [price.usd * 0.98, price.usd]} 
                      color={price.change24h >= 0 ? "#39FF14" : "#FF3333"}
                    />
                  </CardContent>
                </Card>

                {/* Network Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Difficulty */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Database className="w-4 h-4" />
                        <span className="text-sm">Difficulty</span>
                      </div>
                      <div className="text-2xl font-bold font-mono">
                        {network.difficulty.toFixed(1)}T
                      </div>
                      <div className={cn(
                        "text-sm mt-1",
                        network.difficultyChange >= 0 ? "text-accent" : "text-destructive"
                      )}>
                        {network.difficultyChange >= 0 ? "+" : ""}
                        {network.difficultyChange.toFixed(1)}% next
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hashrate */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm">Hashrate</span>
                      </div>
                      <div className="text-2xl font-bold font-mono">
                        {formatHashrate(network.hashrate)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Network security
                      </div>
                    </CardContent>
                  </Card>

                  {/* Block Height */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Block Height</span>
                      </div>
                      <div className="text-2xl font-bold font-mono">
                        {network.blockHeight.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {network.blocksUntilAdjustment.toLocaleString()} to adjustment
                      </div>
                    </CardContent>
                  </Card>

                  {/* Block Reward */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">Block Reward</span>
                      </div>
                      <div className="text-2xl font-bold font-mono">
                        {economics.blockSubsidy} BTC
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        ~${(economics.blockSubsidy * price.usd).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Halving Countdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">⏱️ Halving Countdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HalvingCountdown data={data} />
                  </CardContent>
                </Card>

                {/* Mempool Status */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className={cn(
                        "w-5 h-5",
                        network.congestionLevel === "critical" ? "text-destructive" :
                        network.congestionLevel === "high" ? "text-amber-500" :
                        "text-accent"
                      )} />
                      Mempool Status
                      <span className={cn(
                        "text-sm px-2 py-0.5 rounded-full",
                        network.congestionLevel === "critical" ? "bg-destructive/20 text-destructive" :
                        network.congestionLevel === "high" ? "bg-amber-500/20 text-amber-500" :
                        network.congestionLevel === "medium" ? "bg-yellow-500/20 text-yellow-500" :
                        "bg-accent/20 text-accent"
                      )}>
                        {network.congestionLevel.toUpperCase()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <span className="ml-2 font-mono">{network.mempoolSize} MB</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transactions:</span>
                        <span className="ml-2 font-mono">{network.mempoolTxs.toLocaleString()}</span>
                      </div>
                    </div>
                    <MempoolChart congestionLevel={network.congestionLevel} />
                  </CardContent>
                </Card>

                {/* Fee Estimates */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Recommended Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Fastest", value: fees.fastestFee, time: "~10 min" },
                        { label: "30 min", value: fees.halfHourFee, time: "~30 min" },
                        { label: "1 hour", value: fees.hourFee, time: "~1 hour" },
                        { label: "Economy", value: fees.economyFee, time: "~few hours" },
                      ].map((fee) => (
                        <div key={fee.label} className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="text-2xl font-bold font-mono">{fee.value}</div>
                          <div className="text-xs text-muted-foreground">sat/vB</div>
                          <div className="text-sm font-medium mt-1">{fee.label}</div>
                          <div className="text-xs text-muted-foreground">{fee.time}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
