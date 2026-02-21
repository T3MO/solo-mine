"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, Zap, Home, GraduationCap, Bitcoin, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  type QuizResult,
  type QuizResultType,
  type QuizAnswers,
} from "@/types/quiz";
import { useProgress } from "@/hooks/useProgress";

// ============================================================================
// Props
// ============================================================================

interface ResultCardProps {
  result: QuizResult;
  answers: QuizAnswers;
  onRetake: () => void;
}

// ============================================================================
// Result Configuration
// ============================================================================

const RESULT_CONFIG: Record<QuizResultType, { gradient: string; border: string; accent: string; icon: React.ReactNode }> = {
  buy_btc: {
    gradient: "from-amber-500/10 via-orange-500/5 to-yellow-500/10",
    border: "border-amber-500/30",
    accent: "text-amber-400",
    icon: <Bitcoin className="w-6 h-6" />,
  },
  education: {
    gradient: "from-cyan-500/10 via-blue-500/5 to-purple-500/10",
    border: "border-cyan-500/30",
    accent: "text-cyan-400",
    icon: <GraduationCap className="w-6 h-6" />,
  },
  home_miner_pool: {
    gradient: "from-emerald-500/10 via-green-500/5 to-teal-500/10",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
    icon: <Home className="w-6 h-6" />,
  },
  solo_miner: {
    gradient: "from-purple-500/10 via-violet-500/5 to-fuchsia-500/10",
    border: "border-purple-500/30",
    accent: "text-purple-400",
    icon: <Zap className="w-6 h-6" />,
  },
  asic_farm: {
    gradient: "from-red-500/10 via-orange-500/5 to-rose-500/10",
    border: "border-red-500/30",
    accent: "text-red-400",
    icon: <Zap className="w-6 h-6" />,
  },
};

// ============================================================================
// Component
// ============================================================================

export function ResultCard({ result, answers, onRetake }: ResultCardProps) {
  const { completeLesson, incrementStat } = useProgress();
  const config = RESULT_CONFIG[result.type];

  // Track completion on mount
  useEffect(() => {
    completeLesson("quiz");
    incrementStat("quizzesCompleted");
  }, [completeLesson, incrementStat]);

  // Build query params for hardware links with electricity rate
  const hardwareHref = useMemo(() => {
    const base = result.primaryCta.href;
    if (answers.electricityCost && !base.includes("?")) {
      return `${base}?electricity=${answers.electricityCost}`;
    }
    return base;
  }, [result.primaryCta.href, answers.electricityCost]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
      }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card
        className={cn(
          "relative overflow-hidden border-2 bg-gradient-to-br",
          config.gradient,
          config.border
        )}
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -inset-[100%] bg-gradient-radial from-primary/5 via-transparent to-transparent"
            animate={{
              x: ["0%", "100%", "0%"],
              y: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Compatibility badge */}
        <motion.div
          className={cn(
            "absolute top-4 right-4 px-3 py-1.5 rounded-full",
            "bg-background/80 backdrop-blur-sm border",
            config.border,
            config.accent
          )}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-sm font-bold">{result.compatibility}% Match</span>
        </motion.div>

        <CardContent className="relative pt-8 pb-6 px-6">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              className={cn(
                "inline-flex items-center justify-center w-16 h-16 rounded-2xl",
                "bg-gradient-to-br border-2 mb-4",
                config.gradient,
                config.border,
                config.accent
              )}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              {config.icon}
            </motion.div>

            <motion.h2
              className={cn("text-2xl font-bold mb-1", config.accent)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {result.title}
            </motion.h2>

            <motion.p
              className="text-sm text-muted-foreground font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Profile: <span className="text-foreground">{result.profileName}</span>
            </motion.p>
          </div>

          {/* Warning if present */}
          <AnimatePresence>
            {result.warning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{result.warning}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description */}
          <motion.div
            className="space-y-3 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {result.description.map((paragraph, i) => (
              <motion.p
                key={i}
                className="text-sm leading-relaxed text-foreground/80"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.1 }}
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>

          {/* Answer Summary */}
          <motion.div
            className="p-4 rounded-lg bg-muted/50 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Your Configuration
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <AnswerItem label="Electricity" value={answers.electricityCost ? `$${answers.electricityCost.toFixed(3)}/kWh` : "Unknown"} />
              <AnswerItem label="Space" value={getLivingLabel(answers.livingSituation)} />
              <AnswerItem label="Tech Level" value={`${answers.techComfort}/5`} />
              <AnswerItem label="Budget" value={getBudgetLabel(answers.budget)} />
            </div>
          </motion.div>
        </CardContent>

        {/* Actions */}
        <CardFooter className="relative flex-col gap-3 pb-6 px-6">
          {/* Primary CTA */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Link href={hardwareHref} className="w-full">
              <Button
                size="lg"
                className={cn(
                  "w-full group relative overflow-hidden",
                  result.type === "buy_btc" && "bg-amber-500 hover:bg-amber-600",
                  result.type === "education" && "bg-cyan-500 hover:bg-cyan-600",
                  result.type === "home_miner_pool" && "bg-emerald-500 hover:bg-emerald-600",
                  result.type === "solo_miner" && "bg-purple-500 hover:bg-purple-600",
                  result.type === "asic_farm" && "bg-red-500 hover:bg-red-600"
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {result.primaryCta.label}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
            </Link>
          </motion.div>

          {/* Secondary CTAs */}
          <motion.div
            className="flex flex-wrap gap-2 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {result.secondaryCtas.map((cta, i) => (
              <Link key={cta.href} href={cta.href}>
                <Button variant="outline" size="sm">
                  {cta.label}
                </Button>
              </Link>
            ))}
          </motion.div>

          {/* Retake button */}
          <motion.button
            onClick={onRetake}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </motion.button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function AnswerItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getLivingLabel(situation: QuizAnswers["livingSituation"]): string {
  const labels: Record<string, string> = {
    apartment: "Apartment",
    garage: "Garage/Basement",
    industrial: "Industrial",
    exploring: "Exploring",
  };
  return situation ? labels[situation] || situation : "Unknown";
}

function getBudgetLabel(budget: QuizAnswers["budget"]): string {
  const labels: Record<string, string> = {
    exploring: "Just Looking",
    "200-300": "$200-300",
    "300-500": "$300-500",
    "500-1000": "$500-1000",
    "1000+": "$1,000+",
  };
  return budget ? labels[budget] || budget : "Unknown";
}
