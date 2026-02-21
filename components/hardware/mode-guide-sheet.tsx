"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency, calculatePoolEarnings } from "@/lib/mining-calculations";
import { HolographicCard } from "@/components/ui/holographic-card";
import type { HardwareDevice } from "@/types/hardware";
import {
  X,
  Zap,
  Bitcoin,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  ExternalLink,
  Calculator,
  ChevronRight,
} from "lucide-react";

interface ModeGuideSheetProps {
  device: HardwareDevice | null;
  isOpen: boolean;
  onClose: () => void;
  electricityCost: number;
}

export function ModeGuideSheet({
  device,
  isOpen,
  onClose,
  electricityCost,
}: ModeGuideSheetProps) {
  const [activeTab, setActiveTab] = useState<"pool" | "solo">("pool");

  // Calculate expected pool earnings for this device
  const poolEarnings = useMemo(() => {
    if (!device) return null;
    return calculatePoolEarnings({
      hashrate: device.hashrate,
      wattage: device.wattage,
      electricityCost,
      btcPrice: 65000,
      difficulty: 83,
      heatReuseEnabled: false,
    });
  }, [device, electricityCost]);

  if (!device) return null;

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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-muted/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-muted/95 backdrop-blur-xl border-b border-white/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-sans font-bold text-foreground">
                  Setup Guide
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close guide"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Device Info */}
              <div className="flex items-center gap-4 mt-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  🔧
                </div>
                <div>
                  <h3 className="font-sans font-bold text-foreground">
                    {device.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {device.manufacturer}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setActiveTab("pool")}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all",
                    activeTab === "pool"
                      ? "bg-secondary/20 text-secondary border border-secondary/30"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Pool Setup
                  </div>
                </button>
                {device.soloCapable && (
                  <button
                    onClick={() => setActiveTab("solo")}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all",
                      activeTab === "solo"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Bitcoin className="w-4 h-4" />
                      Solo Setup
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "pool" ? (
                  <motion.div
                    key="pool"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Best for */}
                    <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                      <h4 className="font-sans font-bold text-secondary mb-2">
                        Best For
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Steady income, beginners, low risk tolerance
                      </p>
                    </div>

                    {/* Setup Steps */}
                    <div>
                      <h4 className="font-sans font-bold text-foreground mb-4">
                        Setup Steps
                      </h4>
                      <div className="space-y-3">
                        {device.setupPool.map((step, index) => (
                          <div
                            key={index}
                            className="flex gap-4 p-4 rounded-lg bg-muted/50 border border-white/5"
                          >
                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-secondary">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expected Earnings */}
                    {poolEarnings && (
                      <HolographicCard variant="pool">
                        <h4 className="font-sans font-bold text-foreground mb-4">
                          Expected Earnings
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Daily
                            </span>
                            <span
                              className={cn(
                                "font-mono font-bold",
                                poolEarnings.dailyProfit >= 0
                                  ? "text-accent"
                                  : "text-destructive"
                              )}
                            >
                              {formatCurrency(poolEarnings.dailyProfit)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Monthly
                            </span>
                            <span
                              className={cn(
                                "font-mono font-bold",
                                poolEarnings.monthlyProfit >= 0
                                  ? "text-accent"
                                  : "text-destructive"
                              )}
                            >
                              {formatCurrency(poolEarnings.monthlyProfit)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Yearly
                            </span>
                            <span
                              className={cn(
                                "font-mono font-bold",
                                poolEarnings.yearlyProfit >= 0
                                  ? "text-accent"
                                  : "text-destructive"
                              )}
                            >
                              {formatCurrency(poolEarnings.yearlyProfit)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Start mining in: 15 minutes
                        </div>
                      </HolographicCard>
                    )}

                    {/* Recommended Pools */}
                    <div>
                      <h4 className="font-sans font-bold text-foreground mb-3">
                        Recommended Pools
                      </h4>
                      <div className="space-y-2">
                        <a
                          href="https://www.viabtc.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div>
                            <div className="font-medium text-foreground">
                              ViaBTC
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Low fees, reliable
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                        <a
                          href="https://slushpool.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div>
                            <div className="font-medium text-foreground">
                              Slush Pool
                            </div>
                            <div className="text-xs text-muted-foreground">
                              First Bitcoin pool, trusted
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="solo"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Warning Banner */}
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-sans font-bold text-destructive mb-1">
                            Lottery Mode
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            99.9% chance of earning $0. Only choose this if you
                            view it as a lottery ticket, not an investment.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Best for */}
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <h4 className="font-sans font-bold text-primary mb-2">
                        Best For
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Supporting decentralization, learning, lottery thrill
                      </p>
                    </div>

                    {/* Setup Steps */}
                    {device.setupSolo ? (
                      <div>
                        <h4 className="font-sans font-bold text-foreground mb-4">
                          Setup Steps
                        </h4>
                        <div className="space-y-3">
                          {device.setupSolo.map((step, index) => (
                            <div
                              key={index}
                              className="flex gap-4 p-4 rounded-lg bg-muted/50 border border-white/5"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary">
                                  {index + 1}
                                </span>
                              </div>
                              <p className="text-sm text-foreground">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-muted/50 border border-white/5 text-center">
                        <p className="text-muted-foreground">
                          This device is not designed for solo mining.
                        </p>
                      </div>
                    )}

                    {/* Expected Time */}
                    {device.expectedBlockTime && (
                      <HolographicCard variant="solo">
                        <h4 className="font-sans font-bold text-foreground mb-4">
                          Expected Time to Block
                        </h4>
                        <div className="text-center py-4">
                          <div className="text-4xl font-mono font-bold text-primary">
                            {device.expectedBlockTime}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            On average, with current network difficulty
                          </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Bitcoin className="w-4 h-4" />
                            Block reward: ~$200,000 USD
                          </div>
                        </div>
                      </HolographicCard>
                    )}

                    {/* Solo Pool Options */}
                    <div>
                      <h4 className="font-sans font-bold text-foreground mb-3">
                        Solo Pool Options
                      </h4>
                      <div className="space-y-2">
                        <a
                          href="http://solo.ckpool.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div>
                            <div className="font-medium text-foreground">
                              Solo CK Pool
                            </div>
                            <div className="text-xs text-muted-foreground">
                              No registration required
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                        <a
                          href="https://bitcoin.org/en/full-node"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div>
                            <div className="font-medium text-foreground">
                              Bitcoin Core
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Run your own full node
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-muted/95 backdrop-blur-xl border-t border-white/10 p-6 space-y-3">
              <a
                href={device.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
              >
                Buy {device.name}
                <ExternalLink className="w-4 h-4" />
              </a>

              <Link
                href={`/tools/variance-simulator?device=${device.id}`}
                onClick={onClose}
              >
                <button className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors">
                  <Calculator className="w-4 h-4" />
                  Simulate Profitability
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
