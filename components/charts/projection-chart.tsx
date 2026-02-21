"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { cn } from "@/lib/utils";
import type { ProjectionChartProps } from "@/types/mining";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_HEIGHT = 300;
const ANIMATION_DURATION = 2000;

// ============================================================================
// COMPONENT
// ============================================================================

export function ProjectionChart({
  poolData,
  soloData,
  colorPool = "#00F0FF", // Cyan for pool
  colorSolo = "#FF6B00", // Orange for solo
  height = DEFAULT_HEIGHT,
  showLegend = true,
  animationDuration = ANIMATION_DURATION,
}: ProjectionChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Intersection Observer for triggering animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const container = document.getElementById("projection-chart-container");
    if (container) {
      observer.observe(container);
    }

    return () => observer.disconnect();
  }, []);

  // Animate data progression
  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      setAnimationProgress(progress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, animationDuration]);

  // Slice data based on animation progress
  const visibleDataPoints = Math.floor(poolData.length * animationProgress);
  const visiblePoolData = poolData.slice(0, visibleDataPoints);
  const visibleSoloData = soloData.slice(0, visibleDataPoints);

  // Generate labels (days)
  const labels = Array.from({ length: visibleDataPoints }, (_, i) => {
    const day = i + 1;
    return day % 30 === 0 ? `Day ${day}` : "";
  });

  // Chart data configuration
  const data: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "Pool Mining (Steady Income)",
        data: visiblePoolData,
        borderColor: colorPool,
        backgroundColor: `${colorPool}20`, // 20 = 12.5% opacity in hex
        borderWidth: 2,
        fill: true,
        tension: 0.4, // Smooth curve
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: colorPool,
        pointBorderColor: "#030305",
        pointBorderWidth: 2,
      },
      {
        label: "Solo Mining (Lottery)",
        data: visibleSoloData,
        borderColor: colorSolo,
        backgroundColor: `${colorSolo}10`, // 10 = 6.25% opacity
        borderWidth: 2,
        fill: true,
        tension: 0, // Sharp lines for lottery effect
        pointRadius: (ctx) => {
          // Highlight jackpot points
          const value = ctx.raw as number;
          const prevValue = ctx.dataset.data[ctx.dataIndex - 1] as number;
          if (value > (prevValue || 0) + 1000) return 8;
          return 0;
        },
        pointHoverRadius: 8,
        pointBackgroundColor: "#39FF14", // Neon green for jackpot
        pointBorderColor: "#030305",
        pointBorderWidth: 2,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // We handle animation manually
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: "top",
        align: "end",
        labels: {
          color: "#F8FAFC",
          font: {
            family: "var(--font-orbitron)",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "line",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(3, 3, 5, 0.9)",
        titleColor: "#F8FAFC",
        bodyColor: "#F8FAFC",
        borderColor: "rgba(255, 107, 0, 0.3)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        titleFont: {
          family: "var(--font-orbitron)",
          size: 14,
        },
        bodyFont: {
          family: "var(--font-jetbrains-mono)",
          size: 12,
        },
        callbacks: {
          title: (items) => {
            const day = items[0].dataIndex + 1;
            return `Day ${day}`;
          },
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y as number;
            return `${label}: $${value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: "rgba(26, 26, 30, 0.5)",
          drawBorder: false,
        },
        ticks: {
          color: "#94A3B8",
          font: {
            family: "var(--font-jetbrains-mono)",
            size: 10,
          },
          maxTicksLimit: 12,
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(26, 26, 30, 0.5)",
          drawBorder: false,
        },
        ticks: {
          color: "#94A3B8",
          font: {
            family: "var(--font-jetbrains-mono)",
            size: 10,
          },
          callback: (value) => {
            const num = value as number;
            if (Math.abs(num) >= 1000) {
              return `$${(num / 1000).toFixed(0)}k`;
            }
            return `$${num}`;
          },
        },
      },
    },
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get final values for summary
  const poolFinal = poolData[poolData.length - 1] || 0;
  const soloFinal = soloData[soloData.length - 1] || 0;

  return (
    <div
      id="projection-chart-container"
      className="w-full"
      style={{ height }}
    >
      {/* Summary Stats */}
      <div className="flex justify-between items-center mb-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colorPool }}
          />
          <span className="text-sm text-muted-foreground">Pool 1-Year:</span>
          <span
            className="text-sm font-mono font-bold"
            style={{ color: colorPool }}
          >
            {formatCurrency(poolFinal * animationProgress)}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2"
        >
          <span className="text-sm text-muted-foreground">Solo 1-Year:</span>
          <span
            className={cn(
              "text-sm font-mono font-bold",
              soloFinal > 0 ? "text-accent" : "text-muted-foreground"
            )}
          >
            {soloFinal > 0
              ? formatCurrency(soloFinal * animationProgress)
              : "$0"}
          </span>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colorSolo }}
          />
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="relative h-[calc(100%-3rem)]"
      >
        <Line ref={chartRef} data={data} options={options} />

        {/* Progress Indicator */}
        {animationProgress < 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${animationProgress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        )}
      </motion.div>

      {/* Legend for Mobile */}
      <div className="md:hidden mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-0.5 rounded"
            style={{ backgroundColor: colorPool }}
          />
          <span className="text-xs text-muted-foreground">
            Pool: Steady accumulation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-0.5 rounded"
            style={{ backgroundColor: colorSolo }}
          />
          <span className="text-xs text-muted-foreground">
            Solo: All-or-nothing lottery
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MINI CHART VARIANT (for compact displays)
// ============================================================================

interface MiniChartProps {
  data: number[];
  color: string;
  height?: number;
  className?: string;
}

export function MiniChart({
  data,
  color,
  height = 60,
  className,
}: MiniChartProps) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min;

  // Generate path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Gradient fill */}
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={`${pathD} L 100,100 L 0,100 Z`}
          fill={`url(#gradient-${color})`}
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
