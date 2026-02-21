"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { JOURNEY_MILESTONES, type ProgressState, type LessonId } from "@/types/progress";
import { CheckCircle, Lock, Circle } from "lucide-react";

interface JourneyTrackerProps {
  progress: ProgressState;
  allowClickLocked?: boolean;
}

export function JourneyTracker({ progress, allowClickLocked = false }: JourneyTrackerProps) {
  // Check if milestone is completed
  const isCompleted = (id: string): boolean => {
    if (id === "ready") {
      // Ready milestone requires all lessons
      return (
        progress.lessons.sha256.completed &&
        progress.lessons.simulator.completed &&
        progress.lessons.hardware.completed
      );
    }
    return progress.lessons[id as LessonId]?.completed || false;
  };

  // Check if milestone is locked
  const isLocked = (milestone: (typeof JOURNEY_MILESTONES)[0]): boolean => {
    if (!milestone.requires) return false;
    return milestone.requires.some((req) => !progress.lessons[req].completed);
  };

  // Get current active milestone
  const getCurrentMilestone = (): string => {
    for (const milestone of JOURNEY_MILESTONES) {
      if (milestone.id === "ready") continue;
      if (!progress.lessons[milestone.id as LessonId]?.completed) {
        return milestone.id;
      }
    }
    return "ready";
  };

  const currentMilestone = getCurrentMilestone();

  return (
    <div className="relative">
      {/* Connecting line background */}
      <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-muted hidden md:block" />

      <div className="space-y-8 md:space-y-12">
        {JOURNEY_MILESTONES.map((milestone, index) => {
          const completed = isCompleted(milestone.id);
          const locked = isLocked(milestone);
          const isCurrent = currentMilestone === milestone.id;
          const canClick = completed || isCurrent || (allowClickLocked && !locked);

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative flex items-start gap-4 md:gap-6",
                !canClick && "opacity-60"
              )}
            >
              {/* Node */}
              <div className="relative z-10 flex-shrink-0">
                <Link
                  href={canClick ? milestone.href : "#"}
                  className={cn(
                    "flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300",
                    completed
                      ? "bg-accent/20 border-accent text-accent"
                      : isCurrent
                      ? "bg-primary/20 border-primary text-primary ring-4 ring-primary/20"
                      : locked
                      ? "bg-muted border-muted-foreground/30 text-muted-foreground"
                      : "bg-muted border-white/20 text-muted-foreground"
                  )}
                  onClick={(e) => {
                    if (!canClick) {
                      e.preventDefault();
                    }
                  }}
                >
                  {completed ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : locked ? (
                    <Lock className="w-6 h-6" />
                  ) : (
                    <span className="text-2xl">{milestone.icon}</span>
                  )}
                </Link>

                {/* Pulse animation for current */}
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                )}

                {/* Connecting line to next node (completed) */}
                {completed && index < JOURNEY_MILESTONES.length - 1 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "100%" }}
                    className="absolute left-1/2 -translate-x-1/2 top-16 w-0.5 bg-accent hidden md:block"
                    style={{ height: "calc(100% + 3rem)" }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <Link
                  href={canClick ? milestone.href : "#"}
                  className={cn(
                    "block group",
                    !canClick && "cursor-not-allowed"
                  )}
                  onClick={(e) => {
                    if (!canClick) {
                      e.preventDefault();
                    }
                  }}
                >
                  <h3
                    className={cn(
                      "text-lg font-sans font-bold transition-colors",
                      completed
                        ? "text-accent"
                        : isCurrent
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {milestone.label}
                    {completed && (
                      <span className="ml-2 text-xs font-normal text-accent">
                        (Completed)
                      </span>
                    )}
                    {isCurrent && (
                      <span className="ml-2 text-xs font-normal text-primary">
                        (Next)
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {milestone.description}
                  </p>

                  {/* Locked message */}
                  {locked && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Complete previous steps to unlock
                    </p>
                  )}
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
