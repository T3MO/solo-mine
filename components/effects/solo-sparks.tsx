"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Spark {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface SoloSparksProps {
  /** Intensity of sparks (0-1) */
  intensity?: number;
  /** Whether sparks should be active */
  active?: boolean;
  /** Trigger a jackpot spark effect */
  jackpot?: boolean;
  className?: string;
}

export function SoloSparks({
  intensity = 0.5,
  active = true,
  jackpot = false,
  className,
}: SoloSparksProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [jackpotFlash, setJackpotFlash] = useState(false);

  // Generate random sparks
  useEffect(() => {
    if (!active) {
      setSparks([]);
      return;
    }

    const generateSpark = (): Spark => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: 50 + Math.random() * 50,
      size: 2 + Math.random() * 4,
      duration: 0.3 + Math.random() * 0.5,
      delay: Math.random() * 0.5,
    });

    // Initial sparks
    const initialSparks = Array.from({ length: Math.floor(8 * intensity) }, generateSpark);
    setSparks(initialSparks);

    // Regenerate sparks periodically
    const interval = setInterval(() => {
      if (Math.random() < intensity) {
        setSparks((prev) => [...prev.slice(-15), generateSpark()]);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [active, intensity]);

  // Jackpot effect
  useEffect(() => {
    if (jackpot) {
      setJackpotFlash(true);
      
      // Generate many sparks
      const jackpotSparks = Array.from({ length: 30 }, (_, i) => ({
        id: Math.random() + i,
        x: 20 + Math.random() * 60,
        y: 30 + Math.random() * 40,
        size: 3 + Math.random() * 5,
        duration: 0.5 + Math.random() * 1,
        delay: Math.random() * 0.3,
      }));
      setSparks(jackpotSparks);

      const timeout = setTimeout(() => setJackpotFlash(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [jackpot]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Background electrical arcs */}
      {active && (
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <motion.path
            d="M10,50 L30,45 L50,55 L70,40 L90,50"
            stroke="#FF6B00"
            strokeWidth="1"
            fill="none"
            animate={{
              d: [
                "M10,50 L30,45 L50,55 L70,40 L90,50",
                "M10,45 L30,55 L50,40 L70,55 L90,45",
                "M10,50 L30,45 L50,55 L70,40 L90,50",
              ],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </svg>
      )}

      {/* Jackpot flash */}
      <AnimatePresence>
        {jackpotFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-accent/30"
          />
        )}
      </AnimatePresence>

      {/* Sparks */}
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            className="absolute rounded-full"
            style={{
              left: `${spark.x}%`,
              top: `${spark.y}%`,
              width: spark.size,
              height: spark.size,
              background: jackpot
                ? "radial-gradient(circle, #39FF14 0%, transparent 70%)"
                : "radial-gradient(circle, #FF6B00 0%, transparent 70%)",
              boxShadow: jackpot
                ? "0 0 10px #39FF14, 0 0 20px #39FF14"
                : "0 0 6px #FF6B00, 0 0 12px #FF6B00",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              x: [0, (Math.random() - 0.5) * 40],
              y: [0, -20 - Math.random() * 30],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: spark.duration,
              delay: spark.delay,
              ease: "easeOut",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Static electricity lines */}
      {active && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              style={{
                top: `${30 + i * 20}%`,
                left: 0,
                right: 0,
              }}
              animate={{
                opacity: [0, 0.5, 0],
                scaleX: [0, 1, 0],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                delay: i * 0.4,
                repeatDelay: 1 + i * 0.5,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
