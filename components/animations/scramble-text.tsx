"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useAnimation, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ScrambleTextProps } from "@/types/crypto";

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CHARSET = "0123456789ABCDEF";
const DEFAULT_DURATION = 800;
const DEFAULT_STAGGER = 30;
const DEFAULT_DELAY = 0;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate random characters for scrambling
 */
function generateRandomChars(length: number, charset: string): string[] {
  return Array.from({ length }, () =>
    charset[Math.floor(Math.random() * charset.length)]
  );
}

/**
 * Check if user prefers reduced motion
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ScrambleText({
  text,
  duration = DEFAULT_DURATION,
  delay = DEFAULT_DELAY,
  staggerDelay = DEFAULT_STAGGER,
  charset = DEFAULT_CHARSET,
  className,
  onComplete,
  trigger = true,
  respectReducedMotion = true,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Calculate animation parameters
  const shouldReduceMotion = respectReducedMotion && prefersReducedMotion;
  const totalChars = text.length;
  const charDuration = duration / totalChars;

  // Scramble animation
  const scramble = useCallback(() => {
    if (shouldReduceMotion) {
      setDisplayText(text);
      onComplete?.();
      return;
    }

    setIsAnimating(true);
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current - delay;
      
      if (elapsed < 0) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      let result = "";
      let allComplete = true;

      for (let i = 0; i < totalChars; i++) {
        const charElapsed = elapsed - i * staggerDelay;
        
        if (charElapsed < 0) {
          // Character hasn't started animating yet
          result += charset[Math.floor(Math.random() * charset.length)];
          allComplete = false;
        } else if (charElapsed < charDuration) {
          // Character is still scrambling
          const progress = charElapsed / charDuration;
          const shouldShowTarget = Math.random() < progress;
          
          if (shouldShowTarget) {
            result += text[i];
          } else {
            result += charset[Math.floor(Math.random() * charset.length)];
            allComplete = false;
          }
        } else {
          // Character animation complete
          result += text[i];
        }
      }

      setDisplayText(result);

      if (!allComplete) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  }, [
    text,
    duration,
    delay,
    staggerDelay,
    charset,
    totalChars,
    charDuration,
    shouldReduceMotion,
    onComplete,
  ]);

  // Trigger animation when text or trigger changes
  useEffect(() => {
    if (!trigger) {
      setDisplayText(text);
      return;
    }

    // Reset and start new animation
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    // Small timeout to ensure state reset
    const timeout = setTimeout(() => {
      scramble();
    }, 10);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [text, trigger, scramble]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <span
      className={cn(
        "font-mono tracking-wider",
        isAnimating && "select-none",
        className
      )}
      aria-label={text}
    >
      {displayText.split("").map((char, index) => (
        <motion.span
          key={`${index}-${text}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.1,
            delay: index * 0.01,
            ease: "easeOut",
          }}
          className="inline-block"
          style={{ minWidth: "0.6em", textAlign: "center" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

// ============================================================================
// HASH DISPLAY VARIANT (with leading zero highlighting)
// ============================================================================

interface HashDisplayProps {
  hash: string;
  highlightZeros?: number;
  className?: string;
  animate?: boolean;
}

export function HashDisplay({
  hash,
  highlightZeros = 0,
  className,
  animate = true,
}: HashDisplayProps) {
  const [displayHash, setDisplayHash] = useState(hash);
  const isAnimatingRef = useRef(false);

  // Scramble effect when hash changes
  useEffect(() => {
    if (!animate) {
      setDisplayHash(hash);
      return;
    }

    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const charset = "0123456789ABCDEF";
    const duration = 400;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      let result = "";
      for (let i = 0; i < hash.length; i++) {
        if (Math.random() < progress) {
          result += hash[i];
        } else {
          result += charset[Math.floor(Math.random() * charset.length)];
        }
      }

      setDisplayHash(result);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayHash(hash);
        isAnimatingRef.current = false;
      }
    };

    requestAnimationFrame(animate);
  }, [hash, animate]);

  // Count actual leading zeros in the hash
  const actualLeadingZeros = displayHash.match(/^0+/)?.[0]?.length || 0;

  return (
    <div
      className={cn(
        "font-mono break-all leading-relaxed",
        className
      )}
    >
      {displayHash.split("").map((char, index) => {
        const isLeadingZero = index < actualLeadingZeros;
        const isTargetZero = index < highlightZeros;
        
        return (
          <motion.span
            key={index}
            className={cn(
              "inline-block transition-all duration-200",
              isLeadingZero && isTargetZero
                ? "text-accent text-glow-accent font-bold"
                : isTargetZero && char === "0"
                ? "text-accent/50"
                : "text-muted-foreground"
            )}
            style={{ minWidth: "0.55em", textAlign: "center" }}
            animate={
              isLeadingZero && isTargetZero
                ? {
                    scale: [1, 1.2, 1],
                    textShadow: [
                      "0 0 10px rgba(57, 255, 20, 0.5)",
                      "0 0 20px rgba(57, 255, 20, 0.8)",
                      "0 0 10px rgba(57, 255, 20, 0.5)",
                    ],
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              repeat: isLeadingZero && isTargetZero ? Infinity : 0,
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </div>
  );
}

// ============================================================================
// NUMBER SCRAMBLE COMPONENT (for counters)
// ============================================================================

interface NumberScrambleProps {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function NumberScramble({
  value,
  className,
  duration = 500,
  prefix = "",
  suffix = "",
}: NumberScrambleProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = Math.round(
        startValue + (endValue - startValue) * easeOut
      );
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={cn("font-mono", className)}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
