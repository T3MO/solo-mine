"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/types/progress";
import { X, Trophy } from "lucide-react";

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!achievement) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn(
            "fixed bottom-32 right-6 z-50",
            "max-w-sm w-full"
          )}
        >
          <div
            className={cn(
              "relative p-6 rounded-2xl",
              "bg-muted/95 backdrop-blur-xl",
              "border-2 border-primary/50",
              "shadow-2xl shadow-primary/30"
            )}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl -z-10" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <motion.div
                initial={{ rotate: -20, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"
              >
                <span className="text-3xl">{achievement.icon}</span>
              </motion.div>

              <div className="flex-1 pr-4">
                {/* Label */}
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Achievement Unlocked!
                </p>

                {/* Name */}
                <h4 className="text-lg font-sans font-bold text-foreground">
                  {achievement.name}
                </h4>

                {/* Description */}
                <p className="text-sm text-muted-foreground mt-1">
                  {achievement.description}
                </p>
              </div>
            </div>

            {/* Progress bar (auto-dismiss) */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-primary/50 rounded-b-2xl"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
