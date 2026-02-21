"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, 
  Home, 
  BookOpen, 
  Calculator, 
  Cpu, 
  ArrowRight, 
  Mail,
  AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ============================================================================
// Glitch Text Effect
// ============================================================================

function GlitchText({ text, className }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 50);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={cn("font-mono tracking-wider", className)}>
      {displayText}
    </span>
  );
}

// ============================================================================
// Orphan Block Animation
// ============================================================================

function OrphanBlock({ delay = 0, x = 0, y = 0 }: { delay?: number; x?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0.5, 1],
        scale: 1,
        x: [0, x * 20, x * 10],
        y: [0, y * 20, y * 10],
        rotate: [0, 360],
      }}
      transition={{
        duration: 20,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute w-12 h-12 border border-border/30 rounded-lg bg-muted/20"
      style={{ left: `${50 + x * 30}%`, top: `${50 + y * 30}%` }}
    >
      <div className="absolute inset-1 border border-border/20 rounded" />
      <div className="absolute inset-2 border border-border/10 rounded" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary/30 rounded-full" />
    </motion.div>
  );
}

// ============================================================================
// Main 404 Page
// ============================================================================

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  // Track 404 errors for debugging
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.warn(`[404] Page not found: ${currentPath}`);
      
      // Send to analytics if available
      if (window.plausible) {
        window.plausible("404", { props: { path: currentPath } });
      }
    }
  }, [currentPath]);

  const quickLinks = [
    { href: "/", label: "Home", icon: Home, description: "Start over" },
    { href: "/learn", label: "Learn", icon: BookOpen, description: "Education center" },
    { href: "/tools/variance-simulator", label: "Simulator", icon: Calculator, description: "Calculate profits" },
    { href: "/hardware", label: "Hardware", icon: Cpu, description: "Browse miners" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orphan blocks */}
        <OrphanBlock delay={0} x={-1} y={-1} />
        <OrphanBlock delay={2} x={1} y={-0.5} />
        <OrphanBlock delay={4} x={-0.5} y={1} />
        <OrphanBlock delay={6} x={0.8} y={0.8} />
        <OrphanBlock delay={8} x={-0.8} y={0.3} />

        {/* Gradient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        {/* Error Code */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">SYSTEM ERROR</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-bold tracking-tight mb-2">
            <GlitchText text="404" className="text-foreground" />
          </h1>
          <p className="text-lg text-muted-foreground font-mono">
            SIGNAL LOST IN THE BLOCKCHAIN
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-8 max-w-md mx-auto"
        >
          The page you're looking for has been orphaned from the main chain. 
          It may have been moved, deleted, or never existed.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => {
                if (searchQuery) {
                  window.location.href = `/hardware?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
            >
              Search
            </Button>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <p className="text-sm text-muted-foreground mb-4">Or navigate to:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map((link, i) => (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all group"
                >
                  <link.icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="font-medium text-sm">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Report Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <a
            href={`mailto:support@solomine.io?subject=Broken%20Link%20Report&body=I%20found%20a%20broken%20link%20on%20your%20site:%20${encodeURIComponent(currentPath)}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
            Report broken link
          </a>
        </motion.div>
      </div>
    </div>
  );
}
