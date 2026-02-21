"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EligibilityQuiz } from "@/components/quiz/eligibility-quiz";
import { cn } from "@/lib/utils";

// ============================================================================
// Cached Result Display
// ============================================================================

interface CachedResult {
  answers: {
    electricityCost: number | null;
    livingSituation: string | null;
    techComfort: number;
    primaryGoal: string | null;
    budget: string | null;
  };
  resultType: string;
  timestamp: number;
}

function CachedResultBanner({ result, onUse, onRetake }: { result: CachedResult; onUse: () => void; onRetake: () => void }) {
  const daysSince = Math.floor((Date.now() - result.timestamp) / (1000 * 60 * 60 * 24));
  const hoursSince = Math.floor((Date.now() - result.timestamp) / (1000 * 60 * 60));
  
  const timeAgo = daysSince > 0 
    ? `${daysSince} day${daysSince > 1 ? 's' : ''} ago`
    : `${hoursSince} hour${hoursSince > 1 ? 's' : ''} ago`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-lg flex items-center gap-2 justify-center sm:justify-start">
                <Sparkles className="w-5 h-5 text-primary" />
                Previous Result Available
              </h3>
              <p className="text-sm text-muted-foreground">
                You completed this quiz {timeAgo}. Your answers are saved.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onRetake}>
                Retake Quiz
              </Button>
              <Button onClick={onUse}>
                View Result
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function QuizPage() {
  const [initialElectricity, setInitialElectricity] = useState<number | null>(null);
  const [cachedResult, setCachedResult] = useState<CachedResult | null>(null);
  const [showCached, setShowCached] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load cached result and check for existing electricity rate from simulator
  useEffect(() => {
    setIsLoading(true);
    
    // Check for cached quiz result
    const cached = localStorage.getItem("solo-mine-quiz-result");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CachedResult;
        // Only use if less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setCachedResult(parsed);
        } else {
          // Clear expired result
          localStorage.removeItem("solo-mine-quiz-result");
        }
      } catch {
        // Invalid data, ignore
      }
    }

    // Check for electricity rate from variance simulator
    const savedConfig = localStorage.getItem("solo-mine-config");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.electricityRate && typeof config.electricityRate === "number") {
          setInitialElectricity(config.electricityRate);
        }
      } catch {
        // Invalid data, ignore
      }
    }

    setIsLoading(false);
  }, []);

  const handleUseCached = () => {
    setShowCached(true);
  };

  const handleRetake = () => {
    localStorage.removeItem("solo-mine-quiz-result");
    setCachedResult(null);
    setShowCached(false);
    setInitialElectricity(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
            >
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">5 Question Assessment</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Should You Mine{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Bitcoin?
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Answer 5 quick questions and we'll tell you if mining makes sense for your situation, 
              or if you should buy Bitcoin directly.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Cached result banner */}
        {cachedResult && !showCached && (
          <CachedResultBanner 
            result={cachedResult} 
            onUse={handleUseCached}
            onRetake={handleRetake}
          />
        )}

        {/* Pre-fill notice */}
        {initialElectricity !== null && !showCached && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-lg bg-secondary/10 border border-secondary/30"
          >
            <p className="text-sm text-center">
              <span className="font-medium">Good news:</span> We found your electricity rate (${initialElectricity.toFixed(3)}/kWh) from the variance simulator. 
              We've pre-filled it for you!
            </p>
          </motion.div>
        )}

        {/* Quiz or Cached Result */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        }>
          {showCached && cachedResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8"
            >
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Previous Result</h2>
                  <p className="text-muted-foreground mb-6">
                    You were matched with: <span className="text-foreground font-medium">{cachedResult.resultType}</span>
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={handleRetake}>
                      Retake Quiz
                    </Button>
                    <Link href={`/hardware?electricity=${cachedResult.answers.electricityCost || 0.12}`}>
                      <Button>
                        Browse Hardware
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <EligibilityQuiz 
              initialElectricity={initialElectricity}
            />
          )}
        </Suspense>

        {/* FAQ / Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <h3 className="text-lg font-bold text-center mb-6">Frequently Asked</h3>
          
          <div className="space-y-3">
            {[
              {
                q: "Is this quiz accurate?",
                a: "We use real-world data including current Bitcoin difficulty, hardware specs, and electricity costs. Results are estimates based on your inputs.",
              },
              {
                q: "What if my electricity is expensive?",
                a: "If your rate is above $0.20/kWh and you have a small budget, we typically recommend buying Bitcoin instead. Mining requires cheap power to be profitable.",
              },
              {
                q: "Can I change my answers?",
                a: "Yes! Use the Back button at any time, or click 'Retake Quiz' after seeing your results. Your answers aren't saved until you complete the quiz.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-4 rounded-lg bg-muted/50"
              >
                <p className="font-medium mb-1">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
