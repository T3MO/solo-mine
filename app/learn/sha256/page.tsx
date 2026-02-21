"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sha256Visualizer } from "@/components/education/sha256-visualizer";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Hash,
  Shield,
  Zap,
  AlertTriangle,
} from "lucide-react";
import type { HashResult } from "@/types/crypto";

// ============================================================================
// METADATA
// ============================================================================

export const metadata = {
  title: "SHA-256 Visualizer | Learn Bitcoin Mining Math",
  description:
    "Interactive educational tool demonstrating SHA-256 hashing, proof-of-work, and the cryptographic foundations of Bitcoin mining.",
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function Sha256LearnPage() {
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [blocksFound, setBlocksFound] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  // Load progress from localStorage
  const { value: progress, setValue: saveProgress } = useLocalStorage<{
    completed: boolean;
    blocksFound: number;
    totalAttempts: number;
  }>({
    key: "solo-mine-sha256-progress",
    initialValue: {
      completed: false,
      blocksFound: 0,
      totalAttempts: 0,
    },
  });

  // Sync state with localStorage on mount
  useEffect(() => {
    if (progress) {
      setLessonCompleted(progress.completed);
      setBlocksFound(progress.blocksFound);
      setTotalAttempts(progress.totalAttempts);
    }
  }, [progress]);

  // Handle block found
  const handleBlockFound = useCallback(
    (result: HashResult, attempts: number) => {
      const newBlocksFound = blocksFound + 1;
      const newTotalAttempts = totalAttempts + attempts;

      setBlocksFound(newBlocksFound);
      setTotalAttempts(newTotalAttempts);

      // Mark as completed if they found a block with 2+ leading zeros
      if (result.leadingZeros >= 2 && !lessonCompleted) {
        setLessonCompleted(true);
      }

      // Save progress
      saveProgress({
        completed: result.leadingZeros >= 2 || lessonCompleted,
        blocksFound: newBlocksFound,
        totalAttempts: newTotalAttempts,
      });
    },
    [blocksFound, totalAttempts, lessonCompleted, saveProgress]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-muted/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Link */}
            <Link href="/learn">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Lessons
              </button>
            </Link>

            {/* Page Title */}
            <div className="hidden md:flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-sans font-bold text-foreground">
                Lesson 1 of 2
              </span>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Blocks Found: {blocksFound}
              </span>
              {lessonCompleted && (
                <span className="flex items-center gap-1 text-xs text-accent">
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-xs font-medium text-secondary mb-6">
              <Hash className="w-3.5 h-3.5" />
              Cryptography Fundamentals
            </span>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight">
              <span className="text-foreground">SHA-256:</span>
              <br />
              <span className="gradient-text">The Math Behind Mining</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Understand why mining requires massive computation. Discover how a
              simple hash function creates an unbreakable proof-of-work system.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Visualizer Section */}
      <section className="py-8">
        <Sha256Visualizer
          defaultInput="Hello Solo Mine"
          defaultDifficulty="medium"
          onBlockFound={handleBlockFound}
        />
      </section>

      {/* Educational Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* What is SHA-256 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Hash className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-foreground">
                What is SHA-256?
              </h2>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                SHA-256 (Secure Hash Algorithm 256-bit) is a cryptographic hash
                function that transforms any amount of data into a fixed 64-character
                hexadecimal string. Think of it as a digital fingerprint—every piece
                of data has a unique hash, and even the tiniest change produces a
                completely different result.
              </p>

              <div className="my-8 p-6 rounded-xl bg-muted/30 border border-white/10">
                <h4 className="font-sans font-bold text-foreground mb-4">
                  Key Properties:
                </h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-1">•</span>
                    <span>
                      <strong className="text-foreground">Deterministic:</strong>{" "}
                      The same input always produces the same hash.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-1">•</span>
                    <span>
                      <strong className="text-foreground">One-way:</strong>{" "}
                      You cannot reverse-engineer the input from the hash.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-1">•</span>
                    <span>
                      <strong className="text-foreground">Avalanche Effect:</strong>{" "}
                      Change one bit, and the entire hash changes completely.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-1">•</span>
                    <span>
                      <strong className="text-foreground">Collision Resistant:</strong>{" "}
                      It&apos;s virtually impossible to find two different inputs
                      with the same hash.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* The Mining Process */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-foreground">
                The Mining Process
              </h2>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Bitcoin mining is essentially a guessing game. Miners take a block
                of transactions, add a random number called a{" "}
                <strong className="text-foreground">nonce</strong> (Number used
                ONCE), and hash the result. The goal? Find a hash that starts with
                a specific number of zeros.
              </p>

              <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-muted/30 border border-white/10 text-center">
                  <div className="text-4xl mb-4">1️⃣</div>
                  <h4 className="font-sans font-bold text-foreground mb-2">
                    Prepare Block
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Combine transactions, previous hash, timestamp, and nonce
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-muted/30 border border-white/10 text-center">
                  <div className="text-4xl mb-4">2️⃣</div>
                  <h4 className="font-sans font-bold text-foreground mb-2">
                    Calculate Hash
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Run SHA-256 on the block data to get a 64-character hash
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-muted/30 border border-white/10 text-center">
                  <div className="text-4xl mb-4">3️⃣</div>
                  <h4 className="font-sans font-bold text-foreground mb-2">
                    Check Target
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Does the hash have enough leading zeros? If yes, you win!
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                If the hash doesn&apos;t meet the target, miners change the nonce and
                try again. And again. Billions of times per second, across the
                entire network. This is what makes Bitcoin secure—the energy
                required to attack the network is far greater than any potential
                reward.
              </p>
            </div>
          </motion.div>

          {/* Difficulty & The Network */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-bold text-foreground">
                Why Proof-of-Work Works
              </h2>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                The genius of Bitcoin&apos;s proof-of-work is that it requires real-world
                resources—electricity and specialized hardware—to produce valid
                blocks. This creates several important properties:
              </p>

              <div className="my-8 p-6 rounded-xl bg-muted/30 border border-white/10">
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <strong className="text-foreground">Cost to Attack:</strong>{" "}
                      To rewrite blockchain history, an attacker would need to
                      control more than 50% of the network&apos;s hash power—requiring
                      billions of dollars in hardware and electricity.
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <strong className="text-foreground">Fair Distribution:</strong>{" "}
                      Anyone with the hardware can participate. No special
                      permissions required.
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <strong className="text-foreground">Predictable Issuance:</strong>{" "}
                      The difficulty adjustment ensures blocks are found every
                      10 minutes on average, regardless of how much hash power
                      joins the network.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-sans font-bold text-accent mb-2">
                      The Energy Question
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Yes, Bitcoin uses significant energy. But this is the cost
                      of having a truly decentralized, censorship-resistant monetary
                      system. The energy isn&apos;t "wasted&quot;—it&apos;s securing
                      hundreds of billions of dollars in value and providing
                      financial freedom to millions of people worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Try It Yourself */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-sans font-bold text-foreground mb-4">
              Try It Yourself
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Go back to the visualizer above and experiment! Try different
              difficulty levels, change the input data, and see how the hash
              changes. Turn on auto-mining and watch the attempts counter climb
              as the computer searches for a valid block.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-lg font-bold",
                    "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  )}
                >
                  <Zap className="w-4 h-4" />
                  Back to Visualizer
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Next Lesson CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">
                Next Lesson
              </span>
              <h3 className="text-xl md:text-2xl font-sans font-bold text-foreground">
                Solo vs Pool Mining: The Variance Simulator
              </h3>
              <p className="text-muted-foreground mt-2">
                Now that you understand the math, see why most miners join pools
                instead of going solo.
              </p>
            </div>

            <Link href="/tools/variance-simulator">
              <button
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-bold",
                  "bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors",
                  "whitespace-nowrap"
                )}
              >
                Next Lesson
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 Solo Mine. Educational content for the Bitcoin community.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/tools"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Tools
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
