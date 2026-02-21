"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PoolWaveProps {
  /** Fill percentage (0-100) */
  fillPercent: number;
  /** Whether the wave should animate */
  animate?: boolean;
  className?: string;
}

export function PoolWave({ fillPercent, animate = true, className }: PoolWaveProps) {
  const clampedFill = Math.max(0, Math.min(100, fillPercent));

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Background */}
      <div className="absolute inset-0 bg-secondary/5 rounded-lg" />

      {/* Liquid fill */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-secondary/20"
        initial={{ height: "0%" }}
        animate={{ height: `${clampedFill}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Wave surface */}
        {animate && (
          <>
            <motion.div
              className="absolute top-0 left-0 right-0 h-4"
              style={{
                background: "linear-gradient(180deg, rgba(0, 240, 255, 0.3) 0%, transparent 100%)",
              }}
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <svg
              className="absolute -top-2 left-0 w-[200%] h-4"
              viewBox="0 0 1200 40"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M0,20 Q150,0 300,20 T600,20 T900,20 T1200,20 V40 H0 Z"
                fill="rgba(0, 240, 255, 0.2)"
                animate={{
                  d: [
                    "M0,20 Q150,0 300,20 T600,20 T900,20 T1200,20 V40 H0 Z",
                    "M0,20 Q150,40 300,20 T600,20 T900,20 T1200,20 V40 H0 Z",
                    "M0,20 Q150,0 300,20 T600,20 T900,20 T1200,20 V40 H0 Z",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </>
        )}
      </motion.div>

      {/* Bubbles */}
      {animate && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-secondary/30"
              style={{
                left: `${20 + i * 15}%`,
                bottom: `${10 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
