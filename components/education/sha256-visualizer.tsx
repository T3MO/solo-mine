"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrambleText, HashDisplay, NumberScramble } from "@/components/animations/scramble-text";
import { MatrixRain } from "@/components/effects/matrix-rain";
import { cn } from "@/lib/utils";
import {
  DIFFICULTY_PRESETS,
  MINING_SPEEDS,
  type DifficultyLevel,
  type MiningSpeed,
  type HashResult,
  type Sha256VisualizerProps,
} from "@/types/crypto";
import {
  Play,
  Pause,
  RotateCcw,
  Info,
  CheckCircle,
  Zap,
  Copy,
  Share2,
  Eye,
  EyeOff,
  Trophy,
} from "lucide-react";

// ============================================================================
// SHA-256 HASH FUNCTION
// ============================================================================

/**
 * Calculate SHA-256 hash using Web Crypto API
 */
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Count leading zeros in hex string
 */
function countLeadingZeros(hash: string): number {
  const match = hash.match(/^0+/);
  return match ? match[0].length : 0;
}

/**
 * Check if hash meets difficulty target
 */
function meetsTarget(hash: string, targetZeros: number): boolean {
  return countLeadingZeros(hash) >= targetZeros;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Sha256Visualizer({
  defaultInput = "Hello Solo Mine",
  defaultDifficulty = "medium",
  showAvalancheDemo = true,
  onBlockFound,
  onHashUpdate,
}: Sha256VisualizerProps) {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  const [input, setInput] = useState(defaultInput);
  const [nonce, setNonce] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(defaultDifficulty);
  const [hash, setHash] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isAutoMining, setIsAutoMining] = useState(false);
  const [miningSpeed, setMiningSpeed] = useState<MiningSpeed>("rabbit");
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [blockFound, setBlockFound] = useState(false);
  const [foundNonce, setFoundNonce] = useState<number | null>(null);
  const [miningTime, setMiningTime] = useState(0);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [challengeMode, setChallengeMode] = useState(false);
  const [userGuess, setUserGuess] = useState("");
  const [guessResult, setGuessResult] = useState<"correct" | "incorrect" | null>(null);
  const [copied, setCopied] = useState(false);
  
  const miningStartTimeRef = useRef<number>(0);
  const autoMineIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // -------------------------------------------------------------------------
  // CALCULATE HASH
  // -------------------------------------------------------------------------
  const calculateHash = useCallback(async () => {
    const message = `${input}${nonce}`;
    const newHash = await sha256(message);
    setHash(newHash);
    
    const leadingZeros = countLeadingZeros(newHash);
    const meetsDiff = meetsTarget(newHash, DIFFICULTY_PRESETS[difficulty].zeros);
    
    const result: HashResult = {
      input,
      nonce,
      hash: newHash,
      leadingZeros,
      meetsTarget: meetsDiff,
      timestamp: Date.now(),
    };
    
    onHashUpdate?.(result);
    return result;
  }, [input, nonce, difficulty, onHashUpdate]);

  // Debounced hash calculation
  useEffect(() => {
    const timeout = setTimeout(() => {
      calculateHash();
    }, 50);
    return () => clearTimeout(timeout);
  }, [calculateHash]);

  // -------------------------------------------------------------------------
  // AUTO MINING
  // -------------------------------------------------------------------------
  const startAutoMining = useCallback(() => {
    if (isAutoMining) return;
    
    setIsAutoMining(true);
    setBlockFound(false);
    setFoundNonce(null);
    setTotalAttempts(0);
    miningStartTimeRef.current = Date.now();
    
    const speed = MINING_SPEEDS[miningSpeed];
    const intervalMs = 1000 / speed.rate;
    
    autoMineIntervalRef.current = setInterval(() => {
      setNonce((prev) => {
        const nextNonce = prev + 1;
        return nextNonce;
      });
      setTotalAttempts((prev) => prev + 1);
    }, intervalMs);
  }, [isAutoMining, miningSpeed]);

  const stopAutoMining = useCallback(() => {
    setIsAutoMining(false);
    if (autoMineIntervalRef.current) {
      clearInterval(autoMineIntervalRef.current);
      autoMineIntervalRef.current = null;
    }
  }, []);

  const resetMining = useCallback(() => {
    stopAutoMining();
    setNonce(0);
    setTotalAttempts(0);
    setBlockFound(false);
    setFoundNonce(null);
    setMiningTime(0);
    setGuessResult(null);
    setUserGuess("");
  }, [stopAutoMining]);

  // Check for block found during auto-mining
  useEffect(() => {
    if (!isAutoMining) return;
    
    const checkHash = async () => {
      const result = await calculateHash();
      
      if (result.meetsTarget && !blockFound) {
        stopAutoMining();
        setBlockFound(true);
        setFoundNonce(nonce);
        const elapsed = (Date.now() - miningStartTimeRef.current) / 1000;
        setMiningTime(elapsed);
        onBlockFound?.(result, totalAttempts);
      }
    };
    
    checkHash();
  }, [nonce, isAutoMining, blockFound, difficulty, onBlockFound, totalAttempts, calculateHash, stopAutoMining]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoMineIntervalRef.current) {
        clearInterval(autoMineIntervalRef.current);
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------
  const handleCopyHash = useCallback(() => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [hash]);

  const handleShare = useCallback(() => {
    const text = `I mined a SHA-256 block with ${totalAttempts.toLocaleString()} attempts! Nonce: ${foundNonce}`;
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  }, [totalAttempts, foundNonce]);

  const handleChallengeGuess = useCallback(() => {
    const guess = parseInt(userGuess, 10);
    if (isNaN(guess)) return;
    
    if (guess === nonce) {
      setGuessResult("correct");
    } else {
      setGuessResult("incorrect");
      setNonce(guess); // Show the hash for their guess
    }
  }, [userGuess, nonce]);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  const targetZeros = DIFFICULTY_PRESETS[difficulty].zeros;
  const leadingZeros = countLeadingZeros(hash);
  const difficultyProgress = Math.min(leadingZeros / targetZeros, 1);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain opacity={0.15} speed={0.5} density={0.3} interactive />

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-4">
            SHA-256 <span className="gradient-text">Visualizer</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how miners change the nonce millions of times to find a hash
            below the target. This is the mathematical foundation of Bitcoin.
          </p>
        </motion.div>

        {/* Main Visualizer Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "relative rounded-2xl border backdrop-blur-xl",
            "bg-muted/40 border-white/10 p-6 md:p-8",
            blockFound && "border-accent/50 shadow-lg shadow-accent/20"
          )}
        >
          {/* Block Found Overlay */}
          <AnimatePresence>
            {blockFound && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-3xl font-sans font-bold text-accent text-glow-accent mb-2">
                    BLOCK FOUND!
                  </h3>
                  <p className="text-foreground mb-4">
                    Found in{" "}
                    <span className="font-mono font-bold text-primary">
                      {totalAttempts.toLocaleString()}
                    </span>{" "}
                    attempts
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Time: {miningTime.toFixed(2)}s | Nonce: {foundNonce}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={resetMining}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                Block Data
              </label>
              <button
                onClick={() => setShowTooltip(showTooltip === "data" ? null : "data")}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            
            <AnimatePresence>
              {showTooltip === "data" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 rounded-lg bg-muted/80 border border-white/10 text-sm text-muted-foreground"
                >
                  This is the data that gets hashed. In Bitcoin, this would
                  include transactions, previous block hash, timestamp, and more.
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter any text..."
              className={cn(
                "w-full px-4 py-3 rounded-lg font-mono text-lg",
                "bg-background/50 border-2 transition-all",
                "border-white/10 focus:border-secondary outline-none",
                "text-foreground placeholder:text-muted-foreground"
              )}
            />
          </div>

          {/* Nonce Control */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Nonce (Number used once)
                </label>
                <button
                  onClick={() => setShowTooltip(showTooltip === "nonce" ? null : "nonce")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <span className="text-2xl font-mono font-bold text-primary">
                <NumberScramble value={nonce} />
              </span>
            </div>

            <AnimatePresence>
              {showTooltip === "nonce" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 rounded-lg bg-muted/80 border border-white/10 text-sm text-muted-foreground"
                >
                  Miners change this number millions of times per second to find
                  a hash below the target. It&apos;s like a lottery ticket number
                  that you can change infinitely.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nonce Slider */}
            <div className="relative h-12 flex items-center mb-4 touch-target">
              <input
                type="range"
                min={0}
                max={10000}
                step={1}
                value={nonce}
                onChange={(e) => {
                  setNonce(parseInt(e.target.value, 10));
                  setBlockFound(false);
                }}
                disabled={isAutoMining}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
              />
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-75"
                  style={{ width: `${(nonce / 10000) * 100}%` }}
                />
              </div>
              <div
                className="absolute h-8 w-8 bg-primary rounded-full shadow-lg shadow-primary/50 border-2 border-background pointer-events-none transition-all duration-75"
                style={{ left: `calc(${(nonce / 10000) * 100}% - 16px)` }}
              />
            </div>

            {/* Mining Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {!isAutoMining ? (
                <button
                  onClick={startAutoMining}
                  disabled={blockFound}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-bold",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "touch-target"
                  )}
                >
                  <Play className="w-4 h-4" />
                  Start Mining
                </button>
              ) : (
                <button
                  onClick={stopAutoMining}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-bold",
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                    "touch-target"
                  )}
                >
                  <Pause className="w-4 h-4" />
                  Stop
                </button>
              )}

              <button
                onClick={resetMining}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-muted text-foreground hover:bg-muted/80 touch-target"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>

              {/* Speed Selector */}
              <div className="flex items-center gap-1 ml-auto">
                {(Object.keys(MINING_SPEEDS) as MiningSpeed[]).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setMiningSpeed(speed)}
                    disabled={isAutoMining}
                    className={cn(
                      "px-3 py-1.5 rounded text-xs font-medium transition-colors",
                      miningSpeed === speed
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                      "disabled:opacity-50"
                    )}
                  >
                    {MINING_SPEEDS[speed].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Attempts Counter */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Attempts</span>
              <span className="font-mono font-bold text-foreground">
                {totalAttempts.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                Difficulty Target
              </label>
              <button
                onClick={() => setShowTooltip(showTooltip === "difficulty" ? null : "difficulty")}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence>
              {showTooltip === "difficulty" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 rounded-lg bg-muted/80 border border-white/10 text-sm text-muted-foreground"
                >
                  The number of leading zeros required. More zeros = harder to
                  find. Bitcoin currently requires ~20 leading zeros, requiring
                  quadrillions of attempts.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(DIFFICULTY_PRESETS) as DifficultyLevel[]).map((level) => {
                const preset = DIFFICULTY_PRESETS[level];
                return (
                  <button
                    key={level}
                    onClick={() => {
                      setDifficulty(level);
                      setBlockFound(false);
                    }}
                    disabled={isAutoMining}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all",
                      difficulty === level
                        ? "border-primary bg-primary/20"
                        : "border-white/10 bg-muted/30 hover:border-white/20",
                      "disabled:opacity-50"
                    )}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {preset.label}
                    </div>
                    <div
                      className="text-lg font-mono font-bold"
                      style={{ color: preset.color }}
                    >
                      {preset.zeros} zero{preset.zeros > 1 ? "s" : ""}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress to target</span>
                <span>{leadingZeros} / {targetZeros} zeros</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${difficultyProgress * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Hash Output */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                SHA-256 Hash Output
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div
              className={cn(
                "p-6 rounded-xl bg-background/50 border-2 font-mono text-lg md:text-xl break-all leading-relaxed",
                "border-white/10",
                leadingZeros >= targetZeros && "border-accent"
              )}
            >
              <HashDisplay
                hash={hash || "0".repeat(64)}
                highlightZeros={targetZeros}
                animate={true}
              />
            </div>

            {leadingZeros >= targetZeros && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-background text-xs font-bold"
              >
                Target Met! 🎉
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Challenge Mode Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => setChallengeMode(!challengeMode)}
            className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {challengeMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {challengeMode ? "Hide Challenge Mode" : "Challenge Mode: Guess the Nonce"}
          </button>

          <AnimatePresence>
            {challengeMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-6 rounded-xl bg-muted/30 border border-white/10"
              >
                <h4 className="font-sans font-bold text-foreground mb-2">
                  🎯 Challenge: Guess the Winning Nonce
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Try to guess a nonce that produces {targetZeros} leading zeros!
                </p>
                <div className="flex gap-2 justify-center">
                  <input
                    type="number"
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    placeholder="Enter your guess..."
                    className="px-4 py-2 rounded-lg bg-background border border-white/10 text-foreground font-mono"
                  />
                  <button
                    onClick={handleChallengeGuess}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                  >
                    Check
                  </button>
                </div>
                {guessResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-4 p-3 rounded-lg font-bold",
                      guessResult === "correct"
                        ? "bg-accent/20 text-accent"
                        : "bg-destructive/20 text-destructive"
                    )}
                  >
                    {guessResult === "correct"
                      ? "🎉 Correct! You found a valid nonce!"
                      : "❌ Not quite. Try again!"}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Educational Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-6 rounded-xl bg-muted/30 border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-secondary" />
            </div>
            <h4 className="font-sans font-bold text-foreground mb-2">What is SHA-256?</h4>
            <p className="text-sm text-muted-foreground">
              A cryptographic one-way function that turns any input into a fixed
              64-character hexadecimal fingerprint. Impossible to reverse.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-muted/30 border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-sans font-bold text-foreground mb-2">Proof of Work</h4>
            <p className="text-sm text-muted-foreground">
              Finding a hash with specific properties requires brute force. This
              energy expenditure secures the network against attacks.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-muted/30 border border-white/10">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Info className="w-5 h-5 text-accent" />
            </div>
            <h4 className="font-sans font-bold text-foreground mb-2">The Avalanche Effect</h4>
            <p className="text-sm text-muted-foreground">
              Change just one character in the input, and the entire hash
              changes completely. This ensures tampering is immediately visible.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
