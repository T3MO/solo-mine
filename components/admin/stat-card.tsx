"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  loading?: boolean;
  trend?: "up" | "down" | "neutral";
  color?: "default" | "success" | "warning" | "danger";
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function StatCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  loading = false,
  trend = "neutral",
  color = "default",
  className,
}: StatCardProps) {
  const colorStyles = {
    default: "bg-slate-800/50 border-slate-700",
    success: "bg-emerald-500/10 border-emerald-500/30",
    warning: "bg-amber-500/10 border-amber-500/30",
    danger: "bg-red-500/10 border-red-500/30",
  };

  const iconBgStyles = {
    default: "bg-slate-700",
    success: "bg-emerald-500/20",
    warning: "bg-amber-500/20",
    danger: "bg-red-500/20",
  };

  const iconColorStyles = {
    default: "text-slate-400",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  if (loading) {
    return (
      <div className={cn(
        "p-6 rounded-xl border",
        colorStyles[color],
        className
      )}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 w-full">
            <div className="h-4 w-20 bg-slate-700 rounded animate-pulse" />
            <div className="h-8 w-32 bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="w-10 h-10 bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-xl border transition-all duration-300",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        colorStyles[color],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
          
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : trend === "down" ? (
                <TrendingDown className="w-3 h-3 text-red-400" />
              ) : null}
              <span className={cn(
                "text-xs font-medium",
                trend === "up" ? "text-emerald-400" :
                trend === "down" ? "text-red-400" :
                "text-slate-400"
              )}>
                {change >= 0 ? "+" : ""}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-slate-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          iconBgStyles[color]
        )}>
          <span className={iconColorStyles[color]}>{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Mini Sparkline Component
// ============================================================================

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function MiniSparkline({ 
  data, 
  color = "#10B981",
  height = 30 
}: MiniSparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none" 
      className="w-full"
      style={{ height }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        fill={color}
        fillOpacity="0.1"
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
}

// ============================================================================
// Progress Bar Component
// ============================================================================

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  color?: string;
}

export function ProgressBar({ 
  value, 
  max, 
  label, 
  color = "bg-primary" 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}
