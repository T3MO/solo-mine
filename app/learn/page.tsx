"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { HolographicCard } from "@/components/ui/holographic-card";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ArrowRight,
  CheckCircle,
  Lock,
  BarChart3,
  Hash,
  Cpu,
  ChevronRight,
  Play,
} from "lucide-react";

// ============================================================================
// LESSONS DATA
// ============================================================================

interface Lesson {
  id: "sha256" | "simulator" | "hardware";
  title: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  estimatedTime: string;
  topics: string[];
}

const lessons: Lesson[] = [
  {
    id: "sha256",
    title: "SHA-256 Fundamentals",
    description: "Understand the cryptographic foundation of Bitcoin mining",
    longDescription: "Learn how SHA-256 hashing works, why proof-of-work requires energy, and what makes the avalanche effect so powerful. Interactive visualizer included.",
    icon: <Hash className="w-6 h-6" />,
    href: "/learn/sha256",
    color: "#00F0FF",
    estimatedTime: "15 min",
    topics: [
      "Cryptographic hash functions",
      "The nonce and mining",
      "Proof-of-work security",
      "Interactive visualizer",
    ],
  },
  {
    id: "simulator",
    title: "Pool vs Solo Strategy",
    description: "Compare mining approaches and find what's right for you",
    longDescription: "See the brutal difference between steady income and the lottery. Calculate real mining profitability with actual SHA-256 difficulty calculations.",
    icon: <BarChart3 className="w-6 h-6" />,
    href: "/tools/variance-simulator",
    color: "#FF6B00",
    estimatedTime: "10 min",
    topics: [
      "Probability calculations",
      "Expected value analysis",
      "Risk assessment",
      "Profitability simulator",
    ],
  },
  {
    id: "hardware",
    title: "Hardware Selection",
    description: "Choose the perfect mining device for your situation",
    longDescription: "Browse curated home mining hardware. Compare efficiency, noise levels, and profitability at your electricity rate. Real devices, honest reviews.",
    icon: <Cpu className="w-6 h-6" />,
    href: "/hardware",
    color: "#39FF14",
    estimatedTime: "20 min",
    topics: [
      "Device comparison",
      "Efficiency ratings",
      "Profitability analysis",
      "Setup guides",
    ],
  },
];

// ============================================================================
// LESSON CARD COMPONENT
// ============================================================================

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
  percentComplete: number;
}

function LessonCard({ lesson, index, isCompleted, percentComplete }: LessonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={lesson.href}>
        <HolographicCard
          className={cn(
            "h-full transition-all duration-300 cursor-pointer group",
            isCompleted && "border-accent/50"
          )}
          style={{
            borderColor: isCompleted ? "#39FF14" : `${lesson.color}30`,
          }}
        >
          {/* Progress bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-xl overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full"
              style={{ backgroundColor: isCompleted ? "#39FF14" : lesson.color }}
            />
          </div>

          {/* Completion Badge */}
          {isCompleted && (
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 border border-accent/30">
              <CheckCircle className="w-3 h-3 text-accent" />
              <span className="text-xs font-bold text-accent">Completed</span>
            </div>
          )}

          {/* Progress Badge (if in progress) */}
          {!isCompleted && percentComplete > 0 && (
            <div 
              className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-bold border"
              style={{ 
                backgroundColor: `${lesson.color}15`,
                borderColor: `${lesson.color}30`,
                color: lesson.color 
              }}
            >
              {percentComplete}% Complete
            </div>
          )}

          {/* Icon */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
            style={{
              backgroundColor: `${lesson.color}15`,
              color: lesson.color,
            }}
          >
            {lesson.icon}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-xs font-bold px-2 py-1 rounded"
              style={{
                backgroundColor: `${lesson.color}15`,
                color: lesson.color,
              }}
            >
              Lesson {index + 1}
            </span>
            <span className="text-xs text-muted-foreground">
              {lesson.estimatedTime}
            </span>
          </div>

          {/* Content */}
          <h3 className="font-sans font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
            {lesson.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {lesson.longDescription}
          </p>

          {/* Topics */}
          <div className="flex flex-wrap gap-2 mb-4">
            {lesson.topics.map((topic) => (
              <span
                key={topic}
                className="text-xs px-2 py-1 rounded bg-background/50 text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-bold transition-colors",
              isCompleted ? "text-accent" : "group-hover:text-primary"
            )}
            style={{ color: isCompleted ? "#39FF14" : lesson.color }}
          >
            {isCompleted ? "Review Lesson" : percentComplete > 0 ? "Continue" : "Start Learning"}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </HolographicCard>
      </Link>
    </motion.div>
  );
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function LearnPage() {
  const { progress, lessons, isLoaded, calculateCompletion, getRecommendedNext } = useProgress();

  const completedLessons = Object.values(lessons).filter((l) => l.completed).length;
  const totalLessons = Object.keys(lessons).length;
  const overallProgress = isLoaded ? calculateCompletion() : 0;
  const recommendedNext = isLoaded ? getRecommendedNext() : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-muted/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <BookOpen className="w-3.5 h-3.5" />
              Mining University
            </span>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight">
              Master Bitcoin
              <br />
              <span className="gradient-text">Mining Fundamentals</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Interactive lessons that take you from cryptographic basics to
              advanced profitability analysis. No prior knowledge required.
            </p>

            {/* Overall Progress */}
            {isLoaded && overallProgress > 0 && (
              <div className="mt-10 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Your Progress</span>
                  <span className="text-sm font-bold text-primary">{overallProgress}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {completedLessons} of {totalLessons} lessons completed
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Continue Where You Left Off */}
      {recommendedNext && recommendedNext.id !== "ready" && (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-medium text-muted-foreground mb-4 text-center">
                Continue where you left off
              </h2>
              <Link href={recommendedNext.href}>
                <HolographicCard className="group cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Recommended Next</p>
                      <h3 className="font-sans font-bold text-foreground text-xl group-hover:text-primary transition-colors">
                        {recommendedNext.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {recommendedNext.description}
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </HolographicCard>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Lessons Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-sans font-bold text-foreground mb-8 text-center">
            All Lessons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(lessons).map(([id, lesson], index) => (
              <LessonCard
                key={id}
                lesson={lesson}
                index={index}
                isCompleted={lesson.completed}
                percentComplete={lesson.percentComplete}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Completion State */}
      {isLoaded && completedLessons === totalLessons && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-muted/10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-6xl mb-6">🎓</div>
              <h2 className="text-3xl font-sans font-bold text-foreground mb-4">
                Congratulations!
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                You&apos;ve completed all lessons. You now have the knowledge to
                make informed decisions about Bitcoin mining.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/tools/variance-simulator">
                  <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
                    Run Simulator
                  </button>
                </Link>
                <Link href="/hardware">
                  <button className="px-6 py-3 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors">
                    Browse Hardware
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-muted/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
              Ready to Start Mining?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Put your knowledge into practice. Use our professional-grade tools
              to calculate profitability and optimize your mining operation.
            </p>
            <Link href="/tools">
              <button
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-bold mx-auto",
                  "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                )}
              >
                Explore Mining Tools
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 Solo Mine. Educational content for the Bitcoin community.
          </p>
        </div>
      </footer>
    </div>
  );
}
