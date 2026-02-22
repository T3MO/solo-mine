"use client";

export const runtime = "edge";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { HolographicCard } from "@/components/ui/holographic-card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { calculatePoolEarnings, formatCurrency } from "@/lib/mining-calculations";
import { cn } from "@/lib/utils";
import hardwareData from "@/data/hardware.json";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  XCircle,
  Zap,
  Volume2,
  Calculator,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Bitcoin,
  Clock,
} from "lucide-react";

interface DevicePageProps {
  params: Promise<{ id: string }>;
}

export default function DeviceDetailPage({ params }: DevicePageProps) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"specs" | "setup">("specs");

  // Find device
  const device = hardwareData.devices.find((d) => d.id === id);

  if (!device) {
    notFound();
  }

  // Get user's electricity rate
  const { value: simulatorConfig } = useLocalStorage<{
    electricityCost?: number;
  }>({
    key: "solo-mine-simulator-config",
    initialValue: {},
  });

  const electricityCost = simulatorConfig?.electricityCost || 0.12;

  // Calculate profitability
  const profitability = useMemo(() => {
    return calculatePoolEarnings({
      hashrate: device.hashrate,
      wattage: device.wattage,
      electricityCost,
      btcPrice: 65000,
      difficulty: 83,
      heatReuseEnabled: false,
    });
  }, [device, electricityCost]);

  // Related devices
  const relatedDevices = hardwareData.devices
    .filter((d) => d.id !== device.id && d.category === device.category)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-muted/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/hardware">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Hardware
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          >
            {/* Image */}
            <div className="aspect-video bg-muted/50 rounded-2xl flex items-center justify-center text-8xl">
              🔧
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {device.isNew && (
                  <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-bold border border-accent/30">
                    New Release
                  </span>
                )}
                {device.isBestValue && (
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold border border-primary/30">
                    Best Value
                  </span>
                )}
                {device.soloCapable && (
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm border border-primary/30">
                    Solo Capable
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-2">
                {device.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {device.manufacturer}
              </p>

              <p className="text-muted-foreground mb-6">{device.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-mono font-bold text-foreground">
                  ${device.price}
                </span>
                <span className="text-muted-foreground">USD</span>
              </div>

              {/* Profitability Badge */}
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6",
                  profitability.isProfitable
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                )}
              >
                {profitability.isProfitable ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Profitable at ${electricityCost.toFixed(2)}/kWh
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    Not profitable at ${electricityCost.toFixed(2)}/kWh
                  </>
                )}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={device.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
                >
                  Buy Now
                  <ExternalLink className="w-4 h-4" />
                </a>

                <Link
                  href={`/tools/variance-simulator?device=${device.id}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  Simulate
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("specs")}
              className={cn(
                "px-4 py-3 font-medium transition-colors",
                activeTab === "specs"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("setup")}
              className={cn(
                "px-4 py-3 font-medium transition-colors",
                activeTab === "setup"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Setup Guide
            </button>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {activeTab === "specs" ? (
              <>
                {/* Specs Grid */}
                <div className="lg:col-span-2 space-y-4">
                  <HolographicCard>
                    <h3 className="font-sans font-bold text-foreground mb-4">
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground mb-1">
                          Hashrate
                        </div>
                        <div className="text-2xl font-mono font-bold text-foreground">
                          {device.hashrate.toLocaleString()}{" "}
                          <span className="text-sm text-muted-foreground">
                            {device.hashrateUnit}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground mb-1">
                          Power Consumption
                        </div>
                        <div className="text-2xl font-mono font-bold text-foreground">
                          {device.wattage}{" "}
                          <span className="text-sm text-muted-foreground">W</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground mb-1">
                          Noise Level
                        </div>
                        <div className="text-2xl font-mono font-bold text-foreground">
                          {device.noise}{" "}
                          <span className="text-sm text-muted-foreground">dB</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground mb-1">
                          Efficiency
                        </div>
                        <div className="text-2xl font-mono font-bold text-foreground">
                          {device.efficiency}{" "}
                          <span className="text-sm text-muted-foreground">
                            J/TH
                          </span>
                        </div>
                      </div>
                    </div>
                  </HolographicCard>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <HolographicCard variant="success">
                      <h3 className="font-sans font-bold text-accent mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Pros
                      </h3>
                      <ul className="space-y-2">
                        {device.pros.map((pro, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="text-accent mt-1">+</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </HolographicCard>

                    <HolographicCard variant="warning">
                      <h3 className="font-sans font-bold text-destructive mb-4 flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        Cons
                      </h3>
                      <ul className="space-y-2">
                        {device.cons.map((con, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="text-destructive mt-1">-</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </HolographicCard>
                  </div>
                </div>

                {/* Earnings Sidebar */}
                <div>
                  <HolographicCard variant="pool">
                    <h3 className="font-sans font-bold text-foreground mb-4">
                      Expected Earnings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Daily</span>
                        <span
                          className={cn(
                            "font-mono font-bold",
                            profitability.dailyProfit >= 0
                              ? "text-accent"
                              : "text-destructive"
                          )}
                        >
                          {formatCurrency(profitability.dailyProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Monthly</span>
                        <span
                          className={cn(
                            "font-mono font-bold",
                            profitability.monthlyProfit >= 0
                              ? "text-accent"
                              : "text-destructive"
                          )}
                        >
                          {formatCurrency(profitability.monthlyProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Yearly</span>
                        <span
                          className={cn(
                            "font-mono font-bold",
                            profitability.yearlyProfit >= 0
                              ? "text-accent"
                              : "text-destructive"
                          )}
                        >
                          {formatCurrency(profitability.yearlyProfit)}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-muted-foreground">Break-even</span>
                        <span className="font-mono font-bold text-foreground">
                          {profitability.breakEvenDays
                            ? `${profitability.breakEvenDays} days`
                            : "Never"}
                        </span>
                      </div>
                    </div>

                    {device.soloCapable && device.expectedBlockTime && (
                      <div className="mt-6 pt-6 border-t border-white/5">
                        <h4 className="font-sans font-bold text-primary mb-2 flex items-center gap-2">
                          <Bitcoin className="w-4 h-4" />
                          Solo Mining
                        </h4>
                        <div className="text-center py-3">
                          <div className="text-2xl font-mono font-bold text-primary">
                            {device.expectedBlockTime}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Expected time to find block
                          </p>
                        </div>
                      </div>
                    )}
                  </HolographicCard>
                </div>
              </>
            ) : (
              <>
                {/* Setup Guide */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Pool Setup */}
                  <HolographicCard variant="pool">
                    <h3 className="font-sans font-bold text-secondary mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Pool Mining Setup
                    </h3>
                    <div className="space-y-4">
                      {device.setupPool.map((step, i) => (
                        <div
                          key={i}
                          className="flex gap-4 p-4 rounded-lg bg-muted/30"
                        >
                          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-secondary">
                              {i + 1}
                            </span>
                          </div>
                          <p className="text-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                  </HolographicCard>

                  {/* Solo Setup */}
                  {device.soloCapable && device.setupSolo && (
                    <HolographicCard variant="solo">
                      <h3 className="font-sans font-bold text-primary mb-4 flex items-center gap-2">
                        <Bitcoin className="w-5 h-5" />
                        Solo Mining Setup
                      </h3>
                      <div className="space-y-4">
                        {device.setupSolo.map((step, i) => (
                          <div
                            key={i}
                            className="flex gap-4 p-4 rounded-lg bg-muted/30"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">
                                {i + 1}
                              </span>
                            </div>
                            <p className="text-foreground">{step}</p>
                          </div>
                        ))}
                      </div>
                    </HolographicCard>
                  )}
                </div>

                {/* Best For */}
                <div>
                  <HolographicCard>
                    <h3 className="font-sans font-bold text-foreground mb-4">
                      Best For
                    </h3>
                    <ul className="space-y-3">
                      {device.bestFor.map((use, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                          {use}
                        </li>
                      ))}
                    </ul>
                  </HolographicCard>
                </div>
              </>
            )}
          </motion.div>

          {/* Related Devices */}
          {relatedDevices.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                Similar Devices
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedDevices.map((related) => (
                  <Link key={related.id} href={`/hardware/${related.id}`}>
                    <HolographicCard className="hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-2xl">
                          🔧
                        </div>
                        <div>
                          <h3 className="font-sans font-bold text-foreground">
                            {related.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {related.manufacturer}
                          </p>
                          <p className="text-lg font-mono font-bold text-primary mt-1">
                            ${related.price}
                          </p>
                        </div>
                      </div>
                    </HolographicCard>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Specifications subject to change. Verify before purchasing.
          </p>
          <Link
            href="/hardware"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Browse All Hardware
          </Link>
        </div>
      </footer>
    </div>
  );
}
