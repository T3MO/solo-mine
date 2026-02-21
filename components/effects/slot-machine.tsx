"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mining-calculations";

interface SlotMachineProps {
  /** Current value to display */
  value: number;
  /** Jackpot value (block reward) */
  jackpotValue: number;
  /** Whether to show jackpot animation */
  showJackpot?: boolean;
  /** Whether machine is spinning */
  isSpinning?: boolean;
  className?: string;
}

export function SlotMachine({
  value,
  jackpotValue,
  showJackpot = false,
  isSpinning = false,
  className,
}: SlotMachineProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [showWin, setShowWin] = useState(false);

  // Animate value changes
  useEffect(() => {
    if (isSpinning) {
      // Random flashing during spin
      const interval = setInterval(() => {
        setDisplayValue(Math.random() > 0.9 ? jackpotValue : 0);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [isSpinning, value, jackpotValue]);

  // Jackpot win effect
  useEffect(() => {
    if (showJackpot) {
      setShowWin(true);
      const timeout = setTimeout(() => setShowWin(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showJackpot]);

  const isWin = displayValue > 0;

  return (
    <div
      className={cn(
        "relative p-6 rounded-xl border-2 overflow-hidden",
        "bg-background/50",
        isWin ? "border-accent shadow-lg shadow-accent/30" : "border-primary/30",
        className
      )}
    >
      {/* Slot machine frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      {/* Reels background */}
      <div className="absolute inset-2 bg-muted/50 rounded-lg overflow-hidden">
        {/* Stripe pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,107,0,0.1) 20px, rgba(255,107,0,0.1) 40px)",
          }}
        />
      </div>

      {/* Display area */}
      <div className="relative z-10 text-center">
        <AnimatePresence mode="wait">
          {showWin ? (
            <motion.div
              key="win"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="py-4"
            >
              <motion.div
                className="text-4xl md:text-5xl font-mono font-bold text-accent text-glow-accent"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -2, 2, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 3,
                }}
              >
                {formatCurrency(jackpotValue)}
              </motion.div>
              <motion.div
                className="mt-2 text-accent font-bold"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                🎉 JACKPOT! 🎉
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="normal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <motion.div
                className={cn(
                  "text-3xl md:text-4xl font-mono font-bold transition-colors",
                  isWin ? "text-accent" : "text-muted-foreground"
                )}
                animate={isSpinning ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 0.2, repeat: isSpinning ? Infinity : 0 }}
              >
                {formatCurrency(displayValue)}
              </motion.div>
              {isSpinning && (
                <div className="mt-2 text-xs text-primary animate-pulse">
                  Rolling...
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative lights */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full",
              showWin ? "bg-accent" : "bg-primary/50"
            )}
            animate={
              showWin
                ? {
                    scale: [1, 1.5, 1],
                    boxShadow: [
                      "0 0 5px #39FF14",
                      "0 0 20px #39FF14",
                      "0 0 5px #39FF14",
                    ],
                  }
                : {
                    opacity: [0.3, 1, 0.3],
                  }
            }
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
