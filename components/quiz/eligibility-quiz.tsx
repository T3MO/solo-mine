"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, HelpCircle, Zap, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";
import {
  type QuizAnswers,
  type QuizResult,
  type QuizResultType,
  DEFAULT_QUIZ_ANSWERS,
  ELECTRICITY_PRESETS,
  LIVING_OPTIONS,
  GOAL_OPTIONS,
  BUDGET_OPTIONS,
  QUIZ_RESULTS,
} from "@/types/quiz";
import { ResultCard } from "./result-card";
import { ElectricityMap } from "./electricity-map";

// ============================================================================
// Question Components
// ============================================================================

interface ElectricityQuestionProps {
  answer: number | null;
  onAnswer: (value: number) => void;
  onOpenMap: () => void;
}

function ElectricityQuestion({ answer, onAnswer, onOpenMap }: ElectricityQuestionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ELECTRICITY_PRESETS.map((preset) => (
          <motion.button
            key={preset.label}
            onClick={() => onAnswer(preset.value)}
            className={cn(
              "relative p-4 rounded-xl border-2 text-left transition-all duration-300",
              "hover:border-primary/60 hover:bg-primary/5",
              answer === preset.value
                ? "border-primary bg-primary/10"
                : "border-border bg-muted/50"
            )}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * ELECTRICITY_PRESETS.indexOf(preset) }}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                answer === preset.value
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}>
                {answer === preset.value && (
                  <Check className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              <div>
                <div className="font-bold">{preset.label}</div>
                <div className="text-sm text-muted-foreground">{preset.region}</div>
                <div className="text-xs text-muted-foreground/70 mt-1">{preset.description}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Map CTA */}
      <motion.button
        onClick={onOpenMap}
        className="w-full p-4 rounded-xl border border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-3"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left">
          <div className="font-medium">Not sure? Check the map</div>
          <div className="text-sm text-muted-foreground">See electricity rates by region</div>
        </div>
      </motion.button>
    </div>
  );
}

interface LivingQuestionProps {
  answer: QuizAnswers["livingSituation"];
  onAnswer: (value: QuizAnswers["livingSituation"]) => void;
}

function LivingQuestion({ answer, onAnswer }: LivingQuestionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {LIVING_OPTIONS.map((option, i) => (
        <motion.button
          key={option.id}
          onClick={() => onAnswer(option.id)}
          className={cn(
            "relative p-4 rounded-xl border-2 text-left transition-all duration-300",
            "hover:border-primary/60 hover:bg-primary/5",
            answer === option.id
              ? "border-primary bg-primary/10"
              : "border-border bg-muted/50"
          )}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{option.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold flex items-center gap-2">
                {option.label}
                {answer === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                )}
              </div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-full bg-background/50 border border-border/50">
                  {option.noiseTolerance}
                </span>
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

interface TechQuestionProps {
  answer: number;
  onAnswer: (value: number) => void;
}

function TechQuestion({ answer, onAnswer }: TechQuestionProps) {
  const levels = [
    { level: 1, label: "Beginner", description: "I get help setting up WiFi" },
    { level: 2, label: "Comfortable", description: "I can install apps and troubleshoot" },
    { level: 3, label: "Intermediate", description: "I've built PCs, used command line" },
    { level: 4, label: "Advanced", description: "I can configure networks, flash firmware" },
    { level: 5, label: "Expert", description: "I'm comfortable with Linux, SSH, JSON configs" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        {levels.map((level) => (
          <motion.button
            key={level.level}
            onClick={() => onAnswer(level.level)}
            className={cn(
              "relative p-4 rounded-xl border-2 text-left transition-all duration-300",
              "hover:border-primary/60 hover:bg-primary/5",
              answer === level.level
                ? "border-primary bg-primary/10"
                : "border-border bg-muted/50"
            )}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * level.level }}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                answer === level.level
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {level.level}
              </div>
              <div className="flex-1">
                <div className="font-bold">{level.label}</div>
                <div className="text-sm text-muted-foreground">{level.description}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

interface GoalQuestionProps {
  answer: QuizAnswers["primaryGoal"];
  onAnswer: (value: QuizAnswers["primaryGoal"]) => void;
}

function GoalQuestion({ answer, onAnswer }: GoalQuestionProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {GOAL_OPTIONS.map((option, i) => (
        <motion.button
          key={option.id}
          onClick={() => onAnswer(option.id)}
          className={cn(
            "relative p-4 rounded-xl border-2 text-left transition-all duration-300",
            "hover:border-primary/60 hover:bg-primary/5",
            answer === option.id
              ? "border-primary bg-primary/10"
              : "border-border bg-muted/50"
          )}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl flex-shrink-0">{option.icon}</span>
            <div className="flex-1">
              <div className="font-bold flex items-center gap-2">
                {option.label}
                {answer === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                )}
              </div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

interface BudgetQuestionProps {
  answer: QuizAnswers["budget"];
  onAnswer: (value: QuizAnswers["budget"]) => void;
}

function BudgetQuestion({ answer, onAnswer }: BudgetQuestionProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {BUDGET_OPTIONS.map((option, i) => (
        <motion.button
          key={option.id}
          onClick={() => onAnswer(option.id)}
          className={cn(
            "relative p-4 rounded-xl border-2 text-left transition-all duration-300",
            "hover:border-primary/60 hover:bg-primary/5",
            answer === option.id
              ? "border-primary bg-primary/10"
              : "border-border bg-muted/50"
          )}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-bold flex items-center gap-2">
                {option.label}
                {answer === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                )}
              </div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {option.examples.map((example) => (
                  <span
                    key={example}
                    className="text-xs px-2 py-1 rounded-full bg-background/50 border border-border/50"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const QUESTIONS = [
  { id: "electricityCost" as const, title: "What's your electricity cost?", description: "Check your electric bill for the rate per kWh" },
  { id: "livingSituation" as const, title: "Where will you mine?", description: "Your space determines noise and power requirements" },
  { id: "techComfort" as const, title: "How technical are you?", description: "This helps us recommend the right setup complexity" },
  { id: "primaryGoal" as const, title: "What's your primary goal?", description: "Different goals require different approaches" },
  { id: "budget" as const, title: "What's your budget?", description: "Helps us recommend the right hardware for your situation" },
];

interface EligibilityQuizProps {
  initialElectricity?: number | null;
}

export function EligibilityQuiz({ initialElectricity }: EligibilityQuizProps) {
  const { progress } = useProgress();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "back">("next");
  const [answers, setAnswers] = useState<QuizAnswers>({
    ...DEFAULT_QUIZ_ANSWERS,
    electricityCost: initialElectricity ?? null,
  });
  const [showMap, setShowMap] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Auto-advance if initial electricity is provided
  useEffect(() => {
    if (initialElectricity !== undefined && currentStep === 0) {
      setCurrentStep(1);
    }
  }, [initialElectricity]);

  const calculateResult = useCallback((): QuizResult & { answers: QuizAnswers } => {
    const { electricityCost, livingSituation, techComfort, primaryGoal, budget } = answers;

    // Calculate scores for each path
    let poolScore = 0;
    let soloScore = 0;
    let learnScore = 0;
    let asicScore = 0;

    // Electricity cost factor
    if (electricityCost !== null) {
      if (electricityCost < 0.10) {
        poolScore += 30;
        soloScore += 30;
        asicScore += 40;
      } else if (electricityCost < 0.15) {
        poolScore += 20;
        soloScore += 15;
        asicScore += 10;
      } else if (electricityCost < 0.20) {
        poolScore += 10;
        soloScore += 5;
      } else {
        asicScore -= 20;
      }
    }

    // Living situation factor
    switch (livingSituation) {
      case "apartment":
        poolScore += 25;
        soloScore += 10;
        asicScore -= 30;
        break;
      case "garage":
        poolScore += 20;
        soloScore += 20;
        asicScore += 10;
        break;
      case "industrial":
        poolScore += 10;
        soloScore += 20;
        asicScore += 40;
        break;
      case "exploring":
        learnScore += 40;
        break;
    }

    // Tech comfort factor
    if (techComfort <= 2) {
      learnScore += 20;
      poolScore += 15;
      soloScore -= 10;
      asicScore -= 10;
    } else if (techComfort <= 4) {
      poolScore += 10;
      soloScore += 10;
      asicScore += 5;
    } else {
      poolScore += 5;
      soloScore += 20;
      asicScore += 20;
    }

    // Goal factor
    switch (primaryGoal) {
      case "income":
        poolScore += 30;
        soloScore -= 20;
        break;
      case "lottery":
        poolScore -= 10;
        soloScore += 35;
        break;
      case "learn":
        learnScore += 40;
        poolScore += 15;
        soloScore += 15;
        break;
      case "heat":
        poolScore += 25;
        soloScore += 15;
        break;
      case "decentralization":
        poolScore += 10;
        soloScore += 30;
        break;
    }

    // Budget factor
    switch (budget) {
      case "exploring":
        learnScore += 40;
        poolScore = 0;
        soloScore = 0;
        asicScore = 0;
        break;
      case "200-300":
        poolScore += 20;
        soloScore += 15;
        asicScore -= 20;
        break;
      case "300-500":
        poolScore += 25;
        soloScore += 20;
        asicScore -= 10;
        break;
      case "500-1000":
        poolScore += 20;
        soloScore += 20;
        asicScore += 10;
        break;
      case "1000+":
        poolScore += 10;
        soloScore += 15;
        asicScore += 40;
        break;
    }

    // Determine result
    let resultType: QuizResultType;
    let compatibility: number;

    const scores = [
      { type: "poolScore", score: poolScore },
      { type: "soloScore", score: soloScore },
      { type: "learnScore", score: learnScore },
      { type: "asicScore", score: asicScore },
    ];

    const maxScore = Math.max(...scores.map(s => s.score));

    // Check for disqualifying conditions
    if (electricityCost && electricityCost > 0.20 && budget === "200-300") {
      resultType = "buy_btc";
      compatibility = Math.max(70, Math.min(95, 100 - (electricityCost - 0.20) * 200));
    } else if (learnScore > 50 || budget === "exploring") {
      resultType = "education";
      compatibility = Math.min(95, 60 + learnScore);
    } else if (asicScore > poolScore && asicScore > soloScore && budget === "1000+") {
      resultType = "asic_farm";
      compatibility = Math.min(95, 50 + asicScore);
    } else if (soloScore > poolScore && soloScore > 30) {
      resultType = "solo_miner";
      compatibility = Math.min(95, 50 + soloScore);
    } else {
      resultType = "home_miner_pool";
      compatibility = Math.min(95, 50 + poolScore);
    }

    const baseResult = QUIZ_RESULTS[resultType];
    return {
      ...baseResult,
      compatibility: Math.round(compatibility),
      answers,
    };
  }, [answers]);

  const handleNext = useCallback(() => {
    if (currentStep < QUESTIONS.length - 1) {
      setDirection("next");
      setCurrentStep(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentStep]);

  // Save quiz result to localStorage when complete
  useEffect(() => {
    if (isComplete) {
      const result = calculateResult();
      const resultToSave = {
        answers: result.answers,
        resultType: result.type,
        timestamp: Date.now(),
      };
      localStorage.setItem("solo-mine-quiz-result", JSON.stringify(resultToSave));
    }
  }, [isComplete, calculateResult]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection("back");
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleAnswer = useCallback((value: unknown) => {
    const questionId = QUESTIONS[currentStep].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  }, [currentStep]);

  const handleRetake = useCallback(() => {
    setIsComplete(false);
    setCurrentStep(0);
    setAnswers(DEFAULT_QUIZ_ANSWERS);
    setDirection("back");
  }, []);

  const canProceed = useMemo(() => {
    const questionId = QUESTIONS[currentStep].id;
    const answer = answers[questionId];
    return answer !== null && answer !== undefined;
  }, [currentStep, answers]);

  const quizProgress = ((currentStep + (isComplete ? 1 : 0)) / QUESTIONS.length) * 100;

  if (isComplete) {
    const result = calculateResult();
    return (
      <div className="py-8 px-4">
        <ResultCard result={result} answers={answers} onRetake={handleRetake} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            Question {currentStep + 1} of {QUESTIONS.length}
          </span>
          <span className="text-primary font-mono">{Math.round(quizProgress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/70"
            initial={{ width: 0 }}
            animate={{ width: `${quizProgress}%` }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">{QUESTIONS[currentStep].title}</CardTitle>
          <CardDescription>{QUESTIONS[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: direction === "next" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === "next" ? -50 : 50 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {currentStep === 0 && (
                <ElectricityQuestion
                  answer={answers.electricityCost}
                  onAnswer={handleAnswer}
                  onOpenMap={() => setShowMap(true)}
                />
              )}
              {currentStep === 1 && (
                <LivingQuestion
                  answer={answers.livingSituation}
                  onAnswer={handleAnswer}
                />
              )}
              {currentStep === 2 && (
                <TechQuestion
                  answer={answers.techComfort}
                  onAnswer={handleAnswer}
                />
              )}
              {currentStep === 3 && (
                <GoalQuestion
                  answer={answers.primaryGoal}
                  onAnswer={handleAnswer}
                />
              )}
              {currentStep === 4 && (
                <BudgetQuestion
                  answer={answers.budget}
                  onAnswer={handleAnswer}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {/* Navigation */}
        <div className="px-6 pb-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="gap-2"
          >
            {currentStep === QUESTIONS.length - 1 ? (
              <>
                See Results
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Electricity Map Modal */}
      <ElectricityMap
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        onSelect={(rate) => {
          handleAnswer(rate);
          setShowMap(false);
        }}
      />
    </div>
  );
}
