"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { JourneyTracker } from "@/components/progress/journey-tracker";
import { AchievementToast } from "@/components/progress/achievement-toast";
import { HolographicCard } from "@/components/ui/holographic-card";
import { SkeletonBlueprint } from "@/components/ui/skeleton-blueprint";
import { ACHIEVEMENTS, type Achievement, type SavedConfig } from "@/types/progress";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calculator,
  Cpu,
  Bitcoin,
  Trophy,
  ChevronRight,
  Trash2,
} from "lucide-react";

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string;
  value: number;
  max?: number;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
  isLoading?: boolean;
}

function StatCard({ title, value, max, unit, icon, color = "primary", isLoading }: StatCardProps) {
  const percent = max ? Math.min(100, (value / max) * 100) : 0;

  return (
    <HolographicCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-mono font-bold text-foreground">
              {value}
              {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            color === "primary" && "bg-primary/10 text-primary",
            color === "secondary" && "bg-secondary/10 text-secondary",
            color === "accent" && "bg-accent/10 text-accent",
            color === "warning" && "bg-destructive/10 text-destructive"
          )}
        >
          {icon}
        </div>
      </div>
      {max && (
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className={cn(
                "h-full rounded-full",
                color === "primary" && "bg-primary",
                color === "secondary" && "bg-secondary",
                color === "accent" && "bg-accent",
                color === "warning" && "bg-destructive"
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(percent)}% of {max} {unit}
          </p>
        </div>
      )}
    </HolographicCard>
  );
}

// ============================================================================
// ACHIEVEMENT CARD COMPONENT
// ============================================================================

interface AchievementCardProps {
  achievement: typeof ACHIEVEMENTS[0];
  isUnlocked: boolean;
}

function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "p-4 rounded-xl border transition-all",
        isUnlocked
          ? "bg-muted/50 border-primary/30"
          : "bg-muted/20 border-white/5 opacity-50 grayscale"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
            isUnlocked ? "bg-primary/20" : "bg-muted"
          )}
        >
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h4
            className={cn(
              "font-sans font-bold",
              isUnlocked ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {achievement.name}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {achievement.description}
          </p>
        </div>
        {isUnlocked && <Trophy className="w-5 h-5 text-primary flex-shrink-0" />}
      </div>
    </motion.div>
  );
}

// ============================================================================
// SAVED CONFIG CARD COMPONENT
// ============================================================================

interface SavedConfigCardProps {
  config: SavedConfig;
  onDelete: () => void;
}

function SavedConfigCard({ config, onDelete }: SavedConfigCardProps) {
  const isProfitable = config.dailyProfit > 0;

  return (
    <HolographicCard className="relative group">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-sans font-bold text-foreground">{config.name}</h4>
          <p className="text-sm text-muted-foreground">{config.deviceName}</p>
        </div>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Delete configuration"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Electricity</span>
          <span className="font-mono">${config.electricityCost.toFixed(2)}/kWh</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Daily Profit</span>
          <span
            className={cn(
              "font-mono font-bold",
              isProfitable ? "text-accent" : "text-destructive"
            )}
          >
            ${config.dailyProfit.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <Link href={`/tools/variance-simulator?config=${config.id}`}>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
            Load in Simulator
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </HolographicCard>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function DashboardPage() {
  const {
    progress,
    isLoaded,
    lessons,
    stats,
    achievements,
    savedConfigs,
    calculateCompletion,
    deleteConfig,
    resetProgress,
    getRecommendedNext,
  } = useProgress();

  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const completionPercent = isLoaded ? calculateCompletion() : 0;
  const recommendedNext = isLoaded ? getRecommendedNext() : null;

  const completedLessons = Object.values(lessons).filter((l) => l.completed).length;
  const totalLessons = Object.keys(lessons).length;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          <SkeletonBlueprint rows={4} />
        </div>
      </div>
    );
  }

  const isEmpty =
    completedLessons === 0 &&
    stats.simulationsRun === 0 &&
    stats.devicesViewed === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Achievement Toast */}
      <AchievementToast
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />

      {/* Main Content */}
      <main className="pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-sans font-bold text-foreground mb-4">
              Your Mining Journey
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Track your education, achievements, and mining configurations
            </p>

            {/* Overall Progress */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-bold text-primary">{completionPercent}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {isEmpty ? (
            // Empty State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                Start Your Mining Journey
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                You haven&apos;t started any lessons yet. Begin with SHA-256
                fundamentals to understand how Bitcoin mining works.
              </p>
              <Link href="/learn/sha256">
                <button className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
                  Start with SHA-256
                </button>
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                <StatCard
                  title="Lessons Completed"
                  value={completedLessons}
                  max={totalLessons}
                  icon={<BookOpen className="w-6 h-6" />}
                  color="primary"
                />
                <StatCard
                  title="Simulations Run"
                  value={stats.simulationsRun}
                  icon={<Calculator className="w-6 h-6" />}
                  color="secondary"
                />
                <StatCard
                  title="Hardware Viewed"
                  value={stats.devicesViewed}
                  max={6}
                  icon={<Cpu className="w-6 h-6" />}
                  color="accent"
                />
                <StatCard
                  title="Blocks Found"
                  value={stats.blocksFound}
                  icon={<Bitcoin className="w-6 h-6" />}
                  color="warning"
                />
              </div>

              {/* Journey Tracker */}
              <div className="mb-12">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                  Learning Path
                </h2>
                <HolographicCard>
                  <JourneyTracker progress={progress} />
                </HolographicCard>
              </div>

              {/* Saved Configurations */}
              {savedConfigs.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                    Saved Configurations
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedConfigs.map((config) => (
                      <SavedConfigCard
                        key={config.id}
                        config={config}
                        onDelete={() => deleteConfig(config.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              <div>
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  Achievements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ACHIEVEMENTS.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={achievements.includes(achievement.id as typeof achievements[0])}
                    />
                  ))}
                </div>
              </div>

              {/* Reset Progress */}
              <div className="mt-16 pt-8 border-t border-white/5 text-center">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  Reset all progress (for testing)
                </button>

                {showResetConfirm && (
                  <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                    <p className="text-sm text-destructive mb-3">
                      Are you sure? This cannot be undone.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          resetProgress();
                          setShowResetConfirm(false);
                        }}
                        className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm"
                      >
                        Reset Everything
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
