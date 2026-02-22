"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HardwareGrid } from "@/components/hardware/hardware-grid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import hardwareData from "@/data/hardware.json";
import type { HardwareDevice } from "@/types/hardware";
import {
  Cpu,
  Shield,
  Clock,
  ChevronRight,
  Calculator,
  Info,
} from "lucide-react";

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function HardwarePage() {
  // Get user's electricity rate from simulator
  const { value: simulatorConfig } = useLocalStorage<{
    electricityCost?: number;
  }>({
    key: "solo-mine-simulator-config",
    initialValue: {},
  });

  const electricityCost = simulatorConfig?.electricityCost || 0.12;

  // Track progress
  const { value: progress, setValue: setProgress } = useLocalStorage<{
    devicesViewed: string[];
  }>({
    key: "solo-mine-hardware-progress",
    initialValue: { devicesViewed: [] },
  });

  const devices = hardwareData.devices as HardwareDevice[];

  return (
    <div className="min-h-screen bg-background">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: devices.map((device, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                name: device.name,
                brand: {
                  "@type": "Brand",
                  name: device.manufacturer,
                },
                offers: {
                  "@type": "Offer",
                  price: device.price,
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                },
                description: device.description,
              },
            })),
          }),
        }}
      />

      {/* Header */}
      <header className="border-b border-white/5 bg-muted/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <span className="font-sans font-bold text-foreground">
                Hardware
              </span>
            </div>

            <Link
              href="/tools/variance-simulator"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Simulator
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Cpu className="w-3.5 h-3.5" />
              Curated Home Miners
            </span>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight">
              Choose Your
              <br />
              <span className="gradient-text">Mining Hardware</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We test every device. No scams, no noise complaints, no unrealistic
              promises. Just honest hardware for honest miners.
            </p>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-white/5">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Tested by us</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-white/5">
              <Info className="w-4 h-4 text-secondary" />
              <span className="text-sm text-muted-foreground">
                Affiliate Disclosure
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-white/5">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">30-day support</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hardware Grid Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading hardware...</div>}>
            <HardwareGrid
              devices={devices}
              electricityCost={electricityCost}
            />
          </Suspense>
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
            className="text-center"
          >
            <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
              Not Sure What to Choose?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Take our 60-second assessment. Enter your electricity rate and see
              which devices are actually profitable for your situation.
            </p>
            <Link href="/tools/variance-simulator">
              <button
                className={cn(
                  "inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold",
                  "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                  "shadow-lg shadow-primary/25"
                )}
              >
                <Calculator className="w-5 h-5" />
                Try the Simulator
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Affiliate Disclosure */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-muted/30 border border-white/5">
            <div className="flex items-start gap-4">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-sans font-bold text-foreground mb-2">
                  Affiliate Disclosure
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We earn commissions on purchases made through our affiliate
                  links. However, our recommendations are based on hands-on testing
                  and real-world performance, not commission rates. We only list
                  devices we&apos;ve actually used or extensively researched. Our
                  goal is to help you make the best decision for your mining
                  goals—even if that means earning less commission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Prices and availability subject to change. Last updated: {new Date().toLocaleDateString()}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/tools"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Tools
            </Link>
            <Link
              href="/learn"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Learn
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
