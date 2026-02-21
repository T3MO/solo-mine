"use client";

import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HolographicCardProps {
  children: ReactNode;
  className?: string;
  /** Color variant for the card accents */
  variant?: "default" | "pool" | "solo" | "warning" | "success";
  /** Whether to show scan lines effect */
  showScanLines?: boolean;
  /** Whether to show animated border glow */
  showGlow?: boolean;
  /** Whether card is in warning state (red border) */
  isWarning?: boolean;
  /** Header content */
  header?: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Inline styles */
  style?: React.CSSProperties;
}

const variantColors = {
  default: {
    border: "rgba(255, 107, 0, 0.3)",
    glow: "rgba(255, 107, 0, 0.2)",
    corner: "#FF6B00",
  },
  pool: {
    border: "rgba(0, 240, 255, 0.3)",
    glow: "rgba(0, 240, 255, 0.2)",
    corner: "#00F0FF",
  },
  solo: {
    border: "rgba(255, 51, 51, 0.3)",
    glow: "rgba(255, 51, 51, 0.2)",
    corner: "#FF3333",
  },
  warning: {
    border: "rgba(255, 51, 51, 0.5)",
    glow: "rgba(255, 51, 51, 0.3)",
    corner: "#FF3333",
  },
  success: {
    border: "rgba(57, 255, 20, 0.3)",
    glow: "rgba(57, 255, 20, 0.2)",
    corner: "#39FF14",
  },
};

export function HolographicCard({
  children,
  className,
  variant = "default",
  showScanLines = true,
  showGlow = true,
  isWarning = false,
  header,
  footer,
  style,
}: HolographicCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const colors = variantColors[isWarning ? "warning" : variant];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-muted/30 backdrop-blur-md",
        "transition-all duration-300",
        className
      )}
      style={{
        border: `1px solid ${isWarning ? "#FF3333" : colors.border}`,
        boxShadow: showGlow
          ? `0 0 20px ${colors.glow}, inset 0 0 20px rgba(0,0,0,0.3)`
          : undefined,
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Scan Lines Overlay */}
      {showScanLines && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.03) 2px,
              rgba(0, 0, 0, 0.03) 4px
            )`,
          }}
        />
      )}

      {/* Holographic Shine Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isHovered
            ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                rgba(255, 255, 255, 0.1) 0%, 
                transparent 50%)`
            : "transparent",
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Corner Accents */}
      <div
        className="absolute top-0 left-0 w-4 h-4 pointer-events-none"
        style={{
          borderTop: `2px solid ${colors.corner}`,
          borderLeft: `2px solid ${colors.corner}`,
        }}
      />
      <div
        className="absolute top-0 right-0 w-4 h-4 pointer-events-none"
        style={{
          borderTop: `2px solid ${colors.corner}`,
          borderRight: `2px solid ${colors.corner}`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none"
        style={{
          borderBottom: `2px solid ${colors.corner}`,
          borderLeft: `2px solid ${colors.corner}`,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none"
        style={{
          borderBottom: `2px solid ${colors.corner}`,
          borderRight: `2px solid ${colors.corner}`,
        }}
      />

      {/* Warning Indicator */}
      {isWarning && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-destructive/20 border border-destructive/30">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs font-mono text-destructive">HIGH COST</span>
        </div>
      )}

      {/* Header */}
      {header && (
        <div className="relative z-10 px-4 py-3 border-b border-white/5">
          {header}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-4 md:p-6">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="relative z-10 px-4 py-3 border-t border-white/5">
          {footer}
        </div>
      )}
    </motion.div>
  );
}
