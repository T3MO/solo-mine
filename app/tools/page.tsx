"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HolographicCard } from "@/components/ui/holographic-card";
import {
  Calculator,
  ArrowRight,
  BarChart3,
  Cpu,
  Zap,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TOOLS DATA
// ============================================================================

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  badge?: string;
}

const tools: Tool[] = [
  {
    id: "variance-simulator",
    name: "Variance Simulator",
    description:
      "Compare Solo vs Pool mining profitability with real SHA-256 difficulty calculations. See the brutal difference between steady income and the lottery.",
    icon: <Calculator className="w-6 h-6" />,
    href: "/tools/variance-simulator",
    color: "#FF6B00",
    badge: "NEW",
  },
  {
    id: "profit-calculator",
    name: "Profit Calculator",
    description:
      "Calculate your mining profits across different devices, electricity costs, and BTC price scenarios.",
    icon: <TrendingUp className="w-6 h-6" />,
    href: "/tools/profit-calculator",
    color: "#00F0FF",
    badge: "COMING SOON",
  },
  {
    id: "difficulty-estimator",
    name: "Difficulty Estimator",
    description:
      "Predict future network difficulty adjustments and their impact on your mining revenue.",
    icon: <BarChart3 className="w-6 h-6" />,
    href: "/tools/difficulty-estimator",
    color: "#39FF14",
    badge: "COMING SOON",
  },
  {
    id: "hardware-comparison",
    name: "Hardware Comparison",
    description:
      "Compare mining devices by efficiency, price, and profitability. Find the best ASIC or FPGA for your setup.",
    icon: <Cpu className="w-6 h-6" />,
    href: "/tools/hardware-comparison",
    color: "#A855F7",
    badge: "COMING SOON",
  },
  {
    id: "pool-finder",
    name: "Pool Finder",
    description:
      "Find the best mining pools based on fees, payout schemes, and geographic proximity.",
    icon: <Zap className="w-6 h-6" />,
    href: "/tools/pool-finder",
    color: "#EC4899",
    badge: "COMING SOON",
  },
];

// ============================================================================
// TOOL CARD COMPONENT
// ============================================================================

interface ToolCardProps {
  tool: Tool;
  index: number;
}

function ToolCard({ tool, index }: ToolCardProps) {
  const isAvailable = !tool.badge?.includes("COMING SOON");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        href={isAvailable ? tool.href : "#"}
        className={cn(!isAvailable && "pointer-events-none")}
      >
        <HolographicCard
          className={cn(
            "h-full transition-all duration-300",
            isAvailable && "hover:scale-[1.02] cursor-pointer",
            !isAvailable && "opacity-60"
          )}
          style={{
            borderColor: `${tool.color}30`,
          }}
        >
          {/* Badge */}
          {tool.badge && (
            <div
              className={cn(
                "absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold",
                tool.badge === "NEW"
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tool.badge}
            </div>
          )}

          {/* Icon */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
            style={{
              backgroundColor: `${tool.color}15`,
              color: tool.color,
            }}
          >
            {tool.icon}
          </div>

          {/* Content */}
          <h3 className="font-sans font-bold text-lg text-foreground mb-2">
            {tool.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tool.description}
          </p>

          {/* Action */}
          {isAvailable && (
            <div className="mt-4 flex items-center gap-2 text-sm font-medium">
              <span style={{ color: tool.color }}>Try it now</span>
              <ArrowRight className="w-4 h-4" style={{ color: tool.color }} />
            </div>
          )}
        </HolographicCard>
      </Link>
    </motion.div>
  );
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-muted/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight">
              Mining <span className="gradient-text">Tools</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Professional-grade calculators and simulators for serious Bitcoin
              miners. Make informed decisions with real data.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
              Want More Tools?
            </h2>
            <p className="text-muted-foreground mb-6">
              We&apos;re constantly building new calculators and simulators. Let
              us know what you need.
            </p>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-6 py-3 rounded-lg font-bold",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 transition-colors"
                )}
              >
                Back to Home
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 Solo Mine. All calculations are estimates.
          </p>
        </div>
      </footer>
    </div>
  );
}
