"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSequence } from "@/components/fx/loading-sequence";
import { useMousePosition } from "@/hooks/useMousePosition";
import {
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Cpu,
  Layers,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

interface StatCardProps {
  value: string;
  label: string;
  trend: string;
  isPositive?: boolean;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const glowVariants = {
  initial: { scale: 1, opacity: 0.5 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const mainContentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/5",
        "bg-muted/50 backdrop-blur-sm p-6 md:p-8",
        "hover:border-primary/30 transition-colors duration-500",
        "cursor-pointer touch-target"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100",
          "transition-opacity duration-500",
          gradient
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        <div
          className={cn(
            "mb-4 inline-flex h-12 w-12 items-center justify-center",
            "rounded-lg bg-primary/10 text-primary",
            "group-hover:scale-110 group-hover:text-primary",
            "transition-transform duration-300"
          )}
        >
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Corner Accents */}
      <div className="absolute -top-px -left-px h-6 w-6 border-l-2 border-t-2 border-primary/30 group-hover:border-primary transition-colors" />
      <div className="absolute -bottom-px -right-px h-6 w-6 border-r-2 border-b-2 border-primary/30 group-hover:border-primary transition-colors" />
    </motion.div>
  );
}

function StatCard({ value, label, trend, isPositive = true }: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/5",
        "bg-muted/30 backdrop-blur-sm p-4 md:p-6",
        "hover:border-secondary/20 transition-all duration-300"
      )}
    >
      <div className="relative z-10">
        <p className="text-2xl md:text-3xl font-bold text-foreground font-mono">
          {value}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            isPositive ? "text-accent" : "text-destructive"
          )}
        >
          {trend}
        </p>
      </div>

      {/* Background Glow */}
      <div
        className={cn(
          "absolute -right-4 -bottom-4 h-24 w-24 rounded-full blur-3xl",
          isPositive ? "bg-accent/10" : "bg-destructive/10"
        )}
      />
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);
  const [showLoadingSequence, setShowLoadingSequence] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  
  const { normalizedX, normalizedY } = useMousePosition();

  // Check localStorage for hasSeenIntro on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      setHasSeenIntro(true);
      setIsContentVisible(true);
      return;
    }

    try {
      const stored = localStorage.getItem("solo-mine-has-seen-intro");
      if (stored === "true") {
        setHasSeenIntro(true);
        setIsContentVisible(true);
      } else {
        setHasSeenIntro(false);
        setShowLoadingSequence(true);
      }
    } catch (error) {
      console.warn("Error reading localStorage:", error);
      setHasSeenIntro(true);
      setIsContentVisible(true);
    }
  }, []);

  // Handle loading sequence completion
  const handleLoadingComplete = useCallback(() => {
    try {
      localStorage.setItem("solo-mine-has-seen-intro", "true");
    } catch (error) {
      console.warn("Error writing to localStorage:", error);
    }
    
    setShowLoadingSequence(false);
    
    // Small delay before showing content for smooth transition
    setTimeout(() => {
      setHasSeenIntro(true);
      setIsContentVisible(true);
    }, 100);
  }, []);

  // Handle skip
  const handleSkip = useCallback(() => {
    handleLoadingComplete();
  }, [handleLoadingComplete]);

  // Reset intro (for testing purposes - accessible via console)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    (window as Window & { resetIntro?: () => void }).resetIntro = () => {
      localStorage.removeItem("solo-mine-has-seen-intro");
      window.location.reload();
    };
  }, []);

  // Show loading state while checking localStorage
  if (hasSeenIntro === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-mono text-sm text-muted-foreground tracking-wider"
        >
          LOADING...
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Loading Sequence Overlay */}
      <AnimatePresence>
        {showLoadingSequence && (
          <LoadingSequence
            onComplete={handleLoadingComplete}
            onSkip={handleSkip}
            showSkip={true}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        variants={mainContentVariants}
        initial="hidden"
        animate={isContentVisible ? "visible" : "hidden"}
        className="relative min-h-screen overflow-hidden"
      >
        {/* Animated Background Grid */}
        <div
          className="fixed inset-0 grid-bg opacity-50"
          style={{
            transform: `perspective(1000px) rotateX(${normalizedY * 2}deg) rotateY(${normalizedX * 2}deg)`,
            transition: "transform 0.3s ease-out",
          }}
        />

        {/* Hero Section */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Background Glow Effects */}
          <motion.div
            variants={glowVariants}
            initial="initial"
            animate="animate"
            className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]"
          />
          <motion.div
            variants={glowVariants}
            initial="initial"
            animate="animate"
            className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-secondary/20 blur-[120px]"
            style={{ animationDelay: "2s" }}
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isContentVisible ? "visible" : "hidden"}
            className="relative z-10 max-w-5xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <Zap className="h-3.5 w-3.5" />
                Next-Gen Mining Protocol
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              <span className="block text-foreground">Solo</span>
              <span className="gradient-text">Mine</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
            >
              Experience the future of home mining with real-time analytics,
              optimized pool management, and institutional-grade hardware
              monitoring.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/quiz">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-lg",
                    "bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground",
                    "hover:bg-primary/90 transition-colors",
                    "shadow-lg shadow-primary/25 hover:shadow-primary/40",
                    "touch-target w-full sm:w-auto justify-center"
                  )}
                >
                  <HelpCircle className="h-4 w-4" />
                  Should I Mine?
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/tools/variance-simulator">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg",
                    "border border-white/10 bg-white/5 px-6 py-3",
                    "text-sm font-semibold text-foreground",
                    "hover:bg-white/10 hover:border-white/20",
                    "transition-all touch-target w-full sm:w-auto justify-center"
                  )}
                >
                  Try Simulator
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={itemVariants}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <StatCard value="$2.4B+" label="Network Hashrate" trend="+23.5%" />
              <StatCard value="150K+" label="Active Miners" trend="+18.2%" />
              <StatCard value="890M" label="Blocks Mined" trend="+31.4%" />
              <StatCard value="99.9%" label="Uptime" trend="+0.01%" />
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Built for the <span className="text-primary">Future</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Advanced features designed for home miners and small-scale
                operations.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="Hardware Security"
                description="Real-time monitoring and automatic failover protection for your mining rigs."
                gradient="bg-gradient-to-br from-primary/10 to-transparent"
              />
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6" />}
                title="Profit Analytics"
                description="Advanced profitability tracking with power cost optimization and ROI projections."
                gradient="bg-gradient-to-br from-secondary/10 to-transparent"
              />
              <FeatureCard
                icon={<Globe className="h-6 w-6" />}
                title="Global Pool Network"
                description="Connect to the best performing pools automatically based on latency and rewards."
                gradient="bg-gradient-to-br from-accent/10 to-transparent"
              />
              <FeatureCard
                icon={<Cpu className="h-6 w-6" />}
                title="AI Optimization"
                description="Machine learning algorithms optimize your mining settings for maximum efficiency."
                gradient="bg-gradient-to-br from-primary/10 to-secondary/10"
              />
              <FeatureCard
                icon={<Layers className="h-6 w-6" />}
                title="Multi-Algorithm"
                description="Support for SHA-256, Scrypt, and emerging algorithms with automatic switching."
                gradient="bg-gradient-to-br from-secondary/10 to-accent/10"
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Instant Payouts"
                description="Receive your mining rewards directly to your wallet with minimal fees."
                gradient="bg-gradient-to-br from-accent/10 to-primary/10"
              />
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2024 Solo Mine. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </motion.div>
    </>
  );
}
