"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HolographicCard } from "@/components/ui/holographic-card";
import { SkeletonBlueprint } from "@/components/ui/skeleton-blueprint";
import { ProjectionChart } from "@/components/charts/projection-chart";
import { PoolWave } from "@/components/effects/pool-wave";
import { SoloSparks } from "@/components/effects/solo-sparks";
import { SlotMachine } from "@/components/effects/slot-machine";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import {
  calculatePoolEarnings,
  calculateSoloEarnings,
  compareMiningStrategies,
  generatePoolProjection,
  generateSoloProjection,
  formatCurrency,
  formatHashrate,
  formatPercent,
  NETWORK_CONSTANTS,
} from "@/lib/mining-calculations";
import {
  DEVICE_PRESETS,
  ELECTRICITY_PRESETS,
  type MiningInputs,
  type DevicePreset,
  type PoolCalculationResult,
  type SoloCalculationResult,
  type MiningComparisonResult,
} from "@/types/mining";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Save,
  RotateCcw,
  Play,
  Pause,
  Flame,
  Bitcoin,
  Clock,
  Calculator,
  Eye,
  EyeOff,
  ChevronRight,
  BarChart3,
} from "lucide-react";

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_INPUTS: MiningInputs = {
  hashrate: 600,
  wattage: 60,
  electricityCost: 0.12,
  btcPrice: 65000,
  difficulty: 83,
  heatReuseEnabled: false,
  blockReward: NETWORK_CONSTANTS.BLOCK_REWARD,
};

const HASHRATE_MIN = 100;
const HASHRATE_MAX = 10000;
const HASHRATE_STEP = 100;

const HIGH_ELECTRICITY_THRESHOLD = 0.15;

// ============================================================================
// VIEW MODE TOGGLE COMPONENT
// ============================================================================

interface ViewModeToggleProps {
  mode: "comparison" | "simulation";
  onChange: (mode: "comparison" | "simulation") => void;
}

function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          mode === "comparison" ? "text-secondary" : "text-muted-foreground"
        )}
      >
        Comparison View
      </span>

      {/* Industrial Toggle Switch */}
      <button
        onClick={() => onChange(mode === "comparison" ? "simulation" : "comparison")}
        className={cn(
          "relative w-20 h-10 rounded-full border-2 transition-colors duration-300",
          "touch-target",
          mode === "comparison"
            ? "border-secondary bg-secondary/10"
            : "border-primary bg-primary/10"
        )}
        aria-label={`Switch to ${mode === "comparison" ? "simulation" : "comparison"} mode`}
      >
        {/* Track lines */}
        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-30">
          <div className="w-px h-4 bg-current" />
          <div className="w-px h-4 bg-current" />
          <div className="w-px h-4 bg-current" />
        </div>

        {/* Lever */}
        <motion.div
          className={cn(
            "absolute top-1 w-7 h-7 rounded-full shadow-lg",
            "bg-gradient-to-b from-white/20 to-transparent",
            mode === "comparison"
              ? "left-1 bg-secondary"
              : "right-1 bg-primary"
          )}
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {/* Lever grip */}
          <div className="absolute inset-1 rounded-full bg-current opacity-20" />
        </motion.div>
      </button>

      <span
        className={cn(
          "text-sm font-medium transition-colors",
          mode === "simulation" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Simulation
      </span>
    </div>
  );
}

// ============================================================================
// SLIDER COMPONENT
// ============================================================================

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  accentColor?: string;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
  formatValue,
  accentColor = "#FF6B00",
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <span className="text-sm font-mono font-bold" style={{ color: accentColor }}>
          {formatValue ? formatValue(value) : value}
          {unit}
        </span>
      </div>
      <div className="relative h-10 flex items-center touch-target">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-100"
            style={{ width: `${percentage}%`, backgroundColor: accentColor }}
          />
        </div>
        <div
          className="absolute h-6 w-6 rounded-full shadow-lg border-2 border-background pointer-events-none transition-all duration-100"
          style={{
            left: `calc(${percentage}% - 12px)`,
            backgroundColor: accentColor,
            boxShadow: `0 0 10px ${accentColor}50`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// DEVICE BUTTON COMPONENT
// ============================================================================

interface DeviceButtonProps {
  preset: DevicePreset;
  isActive: boolean;
  onClick: () => void;
}

function DeviceButton({ preset, isActive, onClick }: DeviceButtonProps) {
  const device = DEVICE_PRESETS[preset];

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-lg text-xs font-medium transition-all border touch-target",
        isActive
          ? "bg-primary/20 border-primary text-primary shadow-md shadow-primary/20"
          : "bg-muted/50 border-white/10 text-muted-foreground hover:border-white/20"
      )}
    >
      <div className="font-sans font-bold">{device.name}</div>
      <div className="font-mono text-[10px] opacity-70">
        {formatHashrate(device.hashrate)}
      </div>
    </motion.button>
  );
}

// ============================================================================
// METRIC ROW COMPONENT
// ============================================================================

interface MetricRowProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  color?: string;
}

function MetricRow({ label, value, subValue, icon, highlight, color }: MetricRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3",
        highlight && "bg-white/5 -mx-3 px-3 rounded-lg"
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon && <span className="opacity-50">{icon}</span>}
        {label}
      </div>
      <div className="text-right">
        <div
          className={cn("font-mono font-bold text-sm", highlight && "text-lg")}
          style={{ color: color || "inherit" }}
        >
          {value}
        </div>
        {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VarianceSimulator() {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  const [inputs, setInputs] = useState<MiningInputs>(DEFAULT_INPUTS);
  const [activePreset, setActivePreset] = useState<DevicePreset>("bitaxe600");
  const [viewMode, setViewMode] = useState<"comparison" | "simulation">("comparison");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationDay, setSimulationDay] = useState(0);
  const [simulationPoolEarnings, setSimulationPoolEarnings] = useState(0);
  const [simulationSoloEarnings, setSimulationSoloEarnings] = useState(0);
  const [simulationSoloHitDay, setSimulationSoloHitDay] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSoloJackpot, setShowSoloJackpot] = useState(false);

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Local storage
  const { value: savedConfig, setValue: saveConfig } = useLocalStorage<Partial<MiningInputs>>({
    key: "solo-mine-simulator-config",
    initialValue: {},
  });

  // -------------------------------------------------------------------------
  // CALCULATIONS
  // -------------------------------------------------------------------------
  const results: MiningComparisonResult = useMemo(() => {
    return compareMiningStrategies(inputs);
  }, [inputs]);

  const { pool, solo, recommendation, riskLevel } = results;

  const chartData = useMemo(() => {
    const poolData = generatePoolProjection(pool.dailyProfit, 365);
    const soloData = generateSoloProjection(
      solo.blockRewardValue,
      solo.probabilityDecimal,
      365
    );
    return { poolData, soloData };
  }, [pool.dailyProfit, solo.blockRewardValue, solo.probabilityDecimal]);

  const isHighElectricityCost = inputs.electricityCost > HIGH_ELECTRICITY_THRESHOLD;

  // Pool fill percentage for wave animation (based on yearly progress)
  const poolFillPercent = Math.min(
    Math.max((pool.yearlyProfit / 1000) * 10, 5),
    95
  );

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------
  const handlePresetSelect = useCallback((preset: DevicePreset) => {
    setActivePreset(preset);
    const device = DEVICE_PRESETS[preset];
    if (preset !== "custom") {
      setInputs((prev) => ({
        ...prev,
        hashrate: device.hashrate,
        wattage: device.wattage,
      }));
    }
  }, []);

  const handleInputChange = useCallback(<K extends keyof MiningInputs>(
    key: K,
    value: MiningInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setActivePreset("custom");
  }, []);

  const handleSaveConfig = useCallback(() => {
    saveConfig(inputs);
  }, [inputs, saveConfig]);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setActivePreset("bitaxe600");
    setIsSimulating(false);
    setSimulationDay(0);
  }, []);

  // -------------------------------------------------------------------------
  // SIMULATION
  // -------------------------------------------------------------------------
  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    setSimulationDay(0);
    setSimulationPoolEarnings(0);
    setSimulationSoloEarnings(0);
    setSimulationSoloHitDay(null);
    setShowSoloJackpot(false);

    // Determine solo hit day based on probability
    const daysToHit = solo.probabilityDecimal > 0
      ? Math.floor(-Math.log(Math.random()) / (solo.probabilityDecimal / 365))
      : null;
    setSimulationSoloHitDay(daysToHit && daysToHit <= 365 ? daysToHit : null);

    let day = 0;
    let poolAccumulated = 0;
    let soloAccumulated = 0;

    simulationIntervalRef.current = setInterval(() => {
      day++;
      poolAccumulated += pool.dailyProfit;

      if (daysToHit && day === daysToHit) {
        soloAccumulated = solo.blockRewardValue;
        setShowSoloJackpot(true);
      }

      setSimulationDay(day);
      setSimulationPoolEarnings(poolAccumulated);
      setSimulationSoloEarnings(soloAccumulated);

      if (day >= 365) {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
        }
        setTimeout(() => {
          setIsSimulating(false);
          setShowSoloJackpot(false);
        }, 3000);
      }
    }, 50);
  }, [pool.dailyProfit, solo.blockRewardValue, solo.probabilityDecimal]);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // RECOMMENDATION BADGE
  // -------------------------------------------------------------------------
  const getRecommendationConfig = () => {
    if (recommendation === "pool" && pool.isProfitable) {
      return {
        text: "RECOMMENDED",
        color: "bg-accent/20 text-accent border-accent/50",
        icon: <CheckCircle className="w-4 h-4" />,
        description: "Pool mining offers steady, reliable income",
      };
    }
    if (recommendation === "solo") {
      return {
        text: "HIGH RISK",
        color: "bg-primary/20 text-primary border-primary/50",
        icon: <AlertTriangle className="w-4 h-4" />,
        description: "Solo mining is a lottery - fun but likely unprofitable",
      };
    }
    if (!pool.isProfitable && !solo.isReasonable) {
      return {
        text: "BUY BTC INSTEAD",
        color: "bg-muted text-muted-foreground border-white/10",
        icon: <TrendingDown className="w-4 h-4" />,
        description: "At current rates, mining costs exceed earnings",
      };
    }
    return {
      text: "NOT VIABLE",
      color: "bg-destructive/20 text-destructive border-destructive/50",
      icon: <TrendingDown className="w-4 h-4" />,
      description: "Consider lower electricity costs or different hardware",
    };
  };

  const recommendationConfig = getRecommendationConfig();

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonBlueprint rows={5} />
          <SkeletonBlueprint rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Simulation Overlay */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="max-w-3xl w-full mx-4">
              <motion.div
                key={simulationDay}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-center mb-8"
              >
                <div className="text-6xl md:text-8xl font-sans font-bold text-glow-primary">
                  Day {simulationDay}
                </div>
                <div className="text-muted-foreground mt-2">of 365</div>
              </motion.div>

              <div className="h-3 bg-muted rounded-full overflow-hidden mb-8">
                <motion.div
                  className="h-full bg-gradient-to-r from-secondary to-primary"
                  style={{ width: `${(simulationDay / 365) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="text-center p-6 rounded-xl bg-secondary/10 border border-secondary/30">
                  <div className="text-secondary font-mono text-sm mb-2">Pool (Steady)</div>
                  <div className="text-3xl md:text-4xl font-mono font-bold text-secondary text-glow-secondary">
                    {formatCurrency(simulationPoolEarnings)}
                  </div>
                </div>

                <div className="text-center p-6 rounded-xl bg-primary/10 border border-primary/30">
                  <div className="text-primary font-mono text-sm mb-2">Solo (Lottery)</div>
                  <div className={cn(
                    "text-3xl md:text-4xl font-mono font-bold",
                    simulationSoloEarnings > 0 ? "text-accent text-glow-accent" : "text-muted-foreground"
                  )}>
                    {simulationSoloEarnings > 0 ? formatCurrency(simulationSoloEarnings) : "$0.00"}
                  </div>
                  {showSoloJackpot && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-2 text-accent font-bold"
                    >
                      🎉 JACKPOT! 🎉
                    </motion.div>
                  )}
                </div>
              </div>

              <button
                onClick={stopSimulation}
                className="mt-8 mx-auto block px-6 py-3 rounded-lg bg-destructive text-destructive-foreground font-bold"
              >
                Stop Simulation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Mode Toggle */}
      <ViewModeToggle mode={viewMode} onChange={setViewMode} />

      {/* Controls Section */}
      <div className="mb-8 space-y-6">
        {/* Device Presets */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Mining Device
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DEVICE_PRESETS) as DevicePreset[]).map((preset) => (
              <DeviceButton
                key={preset}
                preset={preset}
                isActive={activePreset === preset}
                onClick={() => handlePresetSelect(preset)}
              />
            ))}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Slider
            label="Hashrate"
            value={inputs.hashrate}
            min={HASHRATE_MIN}
            max={HASHRATE_MAX}
            step={HASHRATE_STEP}
            onChange={(v) => handleInputChange("hashrate", v)}
            formatValue={formatHashrate}
            accentColor="#FF6B00"
          />

          <Slider
            label="Power Consumption"
            value={inputs.wattage}
            min={10}
            max={200}
            step={5}
            unit="W"
            onChange={(v) => handleInputChange("wattage", v)}
            accentColor="#FF6B00"
          />

          <div className="space-y-4">
            <Slider
              label="Electricity Cost"
              value={inputs.electricityCost}
              min={0.05}
              max={0.3}
              step={0.01}
              unit="/kWh"
              onChange={(v) => handleInputChange("electricityCost", v)}
              formatValue={(v) => `$${v.toFixed(2)}`}
              accentColor="#FF6B00"
            />
            <div className="flex flex-wrap gap-2">
              {ELECTRICITY_PRESETS.filter((p) => p.value <= 0.2).map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleInputChange("electricityCost", preset.value)}
                  className={cn(
                    "px-2 py-1 text-xs rounded border transition-colors",
                    inputs.electricityCost === preset.value
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-muted/30 border-white/10 text-muted-foreground"
                  )}
                >
                  {preset.label} (${preset.value.toFixed(2)})
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="BTC Price"
            value={inputs.btcPrice}
            min={30000}
            max={150000}
            step={1000}
            onChange={(v) => handleInputChange("btcPrice", v)}
            formatValue={(v) => `$${v.toLocaleString()}`}
            accentColor="#FF6B00"
          />
        </div>

        {/* Heat Reuse Toggle */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-white/5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.heatReuseEnabled}
              onChange={(e) => handleInputChange("heatReuseEnabled", e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-muted accent-primary"
            />
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Enable Heat Reuse</span>
            </div>
          </label>
          {inputs.heatReuseEnabled && (
            <span className="text-xs text-accent font-medium ml-auto">
              Heating Mode Active (-30% cost)
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={isSimulating ? stopSimulation : startSimulation}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors",
              isSimulating
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
              "touch-target"
            )}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isSimulating ? "Stop" : "Simulate 1 Year"}
          </button>

          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted text-foreground hover:bg-muted/80 touch-target"
          >
            <Save className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted text-foreground hover:bg-muted/80 touch-target"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm">
            {recommendationConfig.icon}
            <span className={recommendationConfig.color.split(" ")[1]}>
              {recommendationConfig.text}
            </span>
          </div>
        </div>
      </div>

      {/* Split Comparison Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* POOL PANEL - The Steady Stream */}
        <HolographicCard
          variant="pool"
          isWarning={isHighElectricityCost && !pool.isProfitable}
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-foreground">Pool Mining</h3>
                  <span className="text-xs text-secondary">The Steady Stream</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono text-accent">99.9% Certain</span>
              </div>
            </div>
          }
        >
          {/* Wave Animation Background */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <PoolWave fillPercent={poolFillPercent} animate />
          </div>

          {/* Primary Metric */}
          <div className="relative z-10 text-center py-6">
            <div className="text-sm text-muted-foreground mb-1">Daily Income</div>
            <motion.div
              key={pool.dailyProfit}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={cn(
                "text-4xl md:text-5xl font-mono font-bold",
                pool.dailyProfit >= 0 ? "text-accent" : "text-destructive"
              )}
            >
              {formatCurrency(pool.dailyProfit)}
            </motion.div>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
              <BarChart3 className="w-3 h-3" />
              LOW Variance
            </div>
          </div>

          {/* Metrics */}
          <div className="relative z-10 space-y-1 border-t border-white/5 pt-4 mt-4">
            <MetricRow
              label="Monthly Projection"
              value={formatCurrency(pool.monthlyProfit)}
              subValue="Expected"
              color={pool.monthlyProfit >= 0 ? "#39FF14" : "#FF3333"}
            />
            <MetricRow
              label="Yearly Projection"
              value={formatCurrency(pool.yearlyProfit)}
              subValue="Stable growth"
              highlight
              color={pool.yearlyProfit >= 0 ? "#39FF14" : "#FF3333"}
            />
            <MetricRow
              label="Electricity Cost"
              value={formatCurrency(pool.dailyEnergyCost) + "/day"}
              icon={<Zap className="w-3 h-3" />}
            />
            <MetricRow
              label="Certainty"
              value="99.9%"
              subValue="Predictable daily payouts"
              icon={<CheckCircle className="w-3 h-3 text-accent" />}
              color="#39FF14"
            />
          </div>
        </HolographicCard>

        {/* SOLO PANEL - The Lottery */}
        <HolographicCard
          variant="solo"
          isWarning={!solo.isReasonable}
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <Bitcoin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-foreground">Solo Mining</h3>
                  <span className="text-xs text-primary">The Lottery</span>
                </div>
              </div>
              <div className="px-2 py-1 rounded bg-destructive/10 text-destructive text-xs font-mono font-bold">
                {riskLevel.toUpperCase()} RISK
              </div>
            </div>
          }
        >
          {/* Sparks Animation */}
          <SoloSparks
            intensity={0.6}
            active
            jackpot={showSoloJackpot}
          />

          {/* Slot Machine Display */}
          <div className="relative z-10 py-4">
            <SlotMachine
              value={0}
              jackpotValue={solo.blockRewardValue}
              showJackpot={showSoloJackpot}
              isSpinning={isSimulating && simulationSoloEarnings === 0}
            />
          </div>

          {/* Probability Visualization */}
          <div className="relative z-10 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Win Probability</span>
              <span className="font-mono font-bold text-primary">
                {formatPercent(solo.yearlyProbability, 4)}
              </span>
            </div>
            <div className="flex gap-0.5 h-8">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-sm transition-colors",
                    i < Math.max(1, solo.yearlyProbability * 10)
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
            <div className="text-center text-xs text-muted-foreground mt-1">
              1 in {Math.ceil(100 / Math.max(solo.yearlyProbability, 0.01)).toLocaleString()} chance per year
            </div>
          </div>

          {/* Metrics */}
          <div className="relative z-10 space-y-1 border-t border-white/5 pt-4 mt-4">
            <MetricRow
              label="Block Reward"
              value={formatCurrency(solo.blockRewardValue)}
              subValue="The jackpot"
              highlight
              icon={<Bitcoin className="w-3 h-3" />}
              color="#FF6B00"
            />
            <MetricRow
              label="Expected Wait"
              value={solo.waitTimeFormatted}
              subValue={solo.isReasonable ? "On average" : "Probably never"}
              icon={<Clock className="w-3 h-3" />}
            />
            <MetricRow
              label="Daily Expected Value"
              value={formatCurrency(solo.expectedDailyValue)}
              subValue="Average over time"
            />
            <MetricRow
              label="Variance"
              value="EXTREME"
              subValue="All-or-nothing outcome"
              icon={<AlertTriangle className="w-3 h-3 text-destructive" />}
              color="#FF3333"
            />
          </div>
        </HolographicCard>
      </div>

      {/* Chart Section */}
      <HolographicCard className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-bold text-lg text-foreground">
            1-Year Projection
          </h3>
          <div className="text-xs text-muted-foreground">
            <span className="text-secondary">Pool: Steady</span>
            <span className="mx-2">•</span>
            <span className="text-primary">Solo: Lottery</span>
          </div>
        </div>
        <ProjectionChart
          poolData={chartData.poolData}
          soloData={chartData.soloData}
          height={350}
          animationDuration={2000}
        />
      </HolographicCard>

      {/* Recommendation & Hardware */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HolographicCard className="md:col-span-2">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="font-sans font-bold text-foreground mb-1">
                Our Recommendation
              </h4>
              <p className="text-sm text-muted-foreground">
                {recommendationConfig.description}
              </p>
            </div>
            <div className={cn(
              "px-4 py-2 rounded-lg border font-bold whitespace-nowrap",
              recommendationConfig.color
            )}>
              {recommendationConfig.text}
            </div>
          </div>
        </HolographicCard>

        <HolographicCard>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Break-Even</div>
            <div className="text-2xl font-mono font-bold text-foreground">
              {pool.isProfitable
                ? `${Math.ceil(100 / pool.dailyProfit)} days`
                : "Never"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              At current rates
            </div>
          </div>
        </HolographicCard>
      </div>
    </div>
  );
}
