"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { VarianceSimulator } from "@/components/simulators/variance-simulator";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calculator,
  Info,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function VarianceSimulatorPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-muted/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/tools">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Tools
              </Button>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <span className="font-sans font-bold text-foreground">
                Variance Simulator
              </span>
            </div>

            <Link
              href="/learn"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Learn
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Calculator className="w-3.5 h-3.5" />
              Solo vs Pool Mining
            </span>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight">
              Solo vs Pool:
              <br />
              <span className="gradient-text">The Only Honest Comparison</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              See why 99% of home miners choose pools (and why some still go solo
              despite the odds). Real calculations, no sugar-coating.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            <div className="p-4 rounded-lg bg-muted/30 border border-white/5">
              <div className="text-2xl font-mono font-bold text-secondary">99.9%</div>
              <div className="text-xs text-muted-foreground">Pool Certainty</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-white/5">
              <div className="text-2xl font-mono font-bold text-primary">&lt;0.01%</div>
              <div className="text-xs text-muted-foreground">Solo Probability</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-white/5">
              <div className="text-2xl font-mono font-bold text-accent">$200k+</div>
              <div className="text-xs text-muted-foreground">Block Reward</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-white/5">
              <div className="text-2xl font-mono font-bold text-foreground">100+</div>
              <div className="text-xs text-muted-foreground">Years Expected</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simulator Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <VarianceSimulator />
        </div>
      </section>

      {/* Educational Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* What is Variance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-foreground">
                What is Variance?
              </h2>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                In statistics, <strong className="text-foreground">variance</strong>{" "}
                measures how spread out numbers are from their average. In Bitcoin
                mining, it describes the difference between expected and actual
                outcomes.
              </p>

              <div className="my-8 p-6 rounded-xl bg-muted/30 border border-white/10">
                <h4 className="font-sans font-bold text-foreground mb-4">
                  The Two Types of Miners
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                    <h5 className="font-sans font-bold text-secondary mb-2">
                      Pool Miners
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Accept slightly lower average returns in exchange for
                      predictable, steady income. Like a salary vs. stock options.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h5 className="font-sans font-bold text-primary mb-2">
                      Solo Miners
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Accept extreme variance for the chance of a massive payout.
                      Like buying lottery tickets instead of investing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* The Lottery Fallacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-foreground">
                The Lottery Fallacy
              </h2>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Many miners are drawn to solo mining because it feels exciting.
                Watching the blockchain, hoping to see your block… it&apos;s
                thrilling! But mathematically, it&apos;s usually a mistake.
              </p>

              <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-white/5 text-center">
                  <div className="text-3xl mb-2">🎰</div>
                  <h5 className="font-bold text-foreground mb-1">Excitement Bias</h5>
                  <p className="text-xs text-muted-foreground">
                    We overweight exciting outcomes vs. boring steady gains
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-white/5 text-center">
                  <div className="text-3xl mb-2">📉</div>
                  <h5 className="font-bold text-foreground mb-1">Loss Aversion</h5>
                  <p className="text-xs text-muted-foreground">
                    Small daily losses feel worse than one big loss
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-white/5 text-center">
                  <div className="text-3xl mb-2">🍀</div>
                  <h5 className="font-bold text-foreground mb-1">Gambler&apos;s Fallacy</h5>
                  <p className="text-xs text-muted-foreground">
                    Believing you&apos;re &quot;due&quot; for a win after losses
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-sans font-bold text-accent mb-2">
                      The Reality Check
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      With a typical home miner (600 GH/s), your chance of finding
                      a block this year is about 0.01%. That means if 10,000 people
                      like you mine solo, only 1 will find a block. The other 9,999
                      get nothing. Are you feeling lucky?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* When to Go Solo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-foreground">
                When to Go Solo
              </h2>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Despite the math, there are legitimate reasons to solo mine:
              </p>

              <div className="my-8 space-y-4">
                <div className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold">1</span>
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-foreground mb-1">
                      Educational Purposes
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Learning how mining works by experiencing the full process,
                      including block template construction and submission.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold">2</span>
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-foreground mb-1">
                      Lottery Entertainment
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      If you view electricity cost as "lottery ticket price" and
                      find joy in the possibility, not the expectation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold">3</span>
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-foreground mb-1">
                      Significant Hash Power
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      If you have 100+ TH/s (industrial scale), solo becomes more
                      reasonable—but you&apos;re still playing the odds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                Ready to Choose Your Hardware?
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Now that you understand the economics, find the perfect mining
                device for your situation. Compare efficiency, price, and
                profitability.
              </p>
            </div>

            <Link href="/hardware">
              <button
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-lg font-bold",
                  "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                  "shadow-lg shadow-primary/25"
                )}
              >
                Browse Hardware
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Calculations are estimates based on current network conditions.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/learn/sha256"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Learn SHA-256
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
