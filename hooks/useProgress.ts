"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type {
  ProgressState,
  LessonId,
  LessonsProgress,
  UserStats,
  AchievementId,
  SavedConfig,
  UseProgressReturn,
  JourneyMilestone,
} from "@/types/progress";
import {
  JOURNEY_MILESTONES,
  ACHIEVEMENTS,
  DEFAULT_PROGRESS_STATE,
  PROGRESS_SCHEMA_VERSION,
} from "@/types/progress";

/**
 * Comprehensive progress tracking hook
 * Manages user progress, achievements, stats, and saved configurations
 */
export function useProgress(): UseProgressReturn {
  // -------------------------------------------------------------------------
  // LOCAL STORAGE
  // -------------------------------------------------------------------------
  const {
    value: progress,
    setValue: setProgress,
    isLoaded,
  } = useLocalStorage<ProgressState>({
    key: "solo-mine-progress",
    initialValue: DEFAULT_PROGRESS_STATE,
  });

  // -------------------------------------------------------------------------
  // MIGRATION
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isLoaded) return;

    // Check if migration is needed
    if (progress.version !== PROGRESS_SCHEMA_VERSION) {
      // Migration logic for future versions
      const migrated: ProgressState = {
        ...DEFAULT_PROGRESS_STATE,
        ...progress,
        version: PROGRESS_SCHEMA_VERSION,
      };
      setProgress(migrated);
    }
  }, [isLoaded, progress, setProgress]);

  // -------------------------------------------------------------------------
  // LESSON METHODS
  // -------------------------------------------------------------------------
  const completeLesson = useCallback(
    (lessonId: LessonId) => {
      setProgress((prev) => ({
        ...prev,
        lessons: {
          ...prev.lessons,
          [lessonId]: {
            ...prev.lessons[lessonId],
            completed: true,
            completedAt: Date.now(),
            percentComplete: 100,
            lastVisited: Date.now(),
          },
        },
      }));
    },
    [setProgress]
  );

  const updateLessonProgress = useCallback(
    (lessonId: LessonId, percent: number) => {
      setProgress((prev) => ({
        ...prev,
        lessons: {
          ...prev.lessons,
          [lessonId]: {
            ...prev.lessons[lessonId],
            percentComplete: Math.min(100, Math.max(0, percent)),
            lastVisited: Date.now(),
          },
        },
      }));
    },
    [setProgress]
  );

  const viewLessonSection = useCallback(
    (lessonId: LessonId, section: string) => {
      setProgress((prev) => {
        const currentSections = prev.lessons[lessonId].sectionsViewed;
        if (currentSections.includes(section)) return prev;

        return {
          ...prev,
          lessons: {
            ...prev.lessons,
            [lessonId]: {
              ...prev.lessons[lessonId],
              sectionsViewed: [...currentSections, section],
              lastVisited: Date.now(),
            },
          },
        };
      });
    },
    [setProgress]
  );

  // -------------------------------------------------------------------------
  // STATS METHODS
  // -------------------------------------------------------------------------
  const incrementStat = useCallback(
    (statName: keyof UserStats, amount: number = 1) => {
      setProgress((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          [statName]: (prev.stats[statName] as number) + amount,
          lastVisit: Date.now(),
        },
      }));
    },
    [setProgress]
  );

  const viewDevice = useCallback(
    (deviceId: string) => {
      setProgress((prev) => {
        if (prev.viewedDevices.includes(deviceId)) return prev;
        return {
          ...prev,
          viewedDevices: [...prev.viewedDevices, deviceId],
          stats: {
            ...prev.stats,
            devicesViewed: prev.stats.devicesViewed + 1,
            lastVisit: Date.now(),
          },
        };
      });
    },
    [setProgress]
  );

  // -------------------------------------------------------------------------
  // CONFIG METHODS
  // -------------------------------------------------------------------------
  const saveConfig = useCallback(
    (config: Omit<SavedConfig, "id" | "savedAt">) => {
      const newConfig: SavedConfig = {
        ...config,
        id: `config-${Date.now()}`,
        savedAt: Date.now(),
      };

      setProgress((prev) => ({
        ...prev,
        savedConfigs: [...prev.savedConfigs, newConfig],
      }));
    },
    [setProgress]
  );

  const deleteConfig = useCallback(
    (configId: string) => {
      setProgress((prev) => ({
        ...prev,
        savedConfigs: prev.savedConfigs.filter((c) => c.id !== configId),
      }));
    },
    [setProgress]
  );

  // -------------------------------------------------------------------------
  // ACHIEVEMENT METHODS
  // -------------------------------------------------------------------------
  const checkAchievements = useCallback((): AchievementId[] => {
    const unlocked: AchievementId[] = [];

    // Hash Master: Found a block
    if (
      progress.stats.blocksFound >= 1 &&
      !progress.achievements.includes("hash-master")
    ) {
      unlocked.push("hash-master");
    }

    // Risk Analyst: 5+ simulations
    if (
      progress.stats.simulationsRun >= 5 &&
      !progress.achievements.includes("risk-analyst")
    ) {
      unlocked.push("risk-analyst");
    }

    // Hardware Scout: Viewed all 6 devices
    if (
      progress.stats.devicesViewed >= 6 &&
      !progress.achievements.includes("hardware-scout")
    ) {
      unlocked.push("hardware-scout");
    }

    // Diamond Hands: 3+ saved configs
    if (
      progress.savedConfigs.length >= 3 &&
      !progress.achievements.includes("diamond-hands")
    ) {
      unlocked.push("diamond-hands");
    }

    // Completest: 100% completion
    const completion = calculateCompletion();
    if (completion >= 100 && !progress.achievements.includes("completest")) {
      unlocked.push("completest");
    }

    // Update state if new achievements unlocked
    if (unlocked.length > 0) {
      setProgress((prev) => ({
        ...prev,
        achievements: [...prev.achievements, ...unlocked],
      }));
    }

    return unlocked;
  }, [progress, setProgress]);

  // Auto-check achievements when stats change
  useEffect(() => {
    if (isLoaded) {
      checkAchievements();
    }
  }, [isLoaded, progress.stats, checkAchievements]);

  // -------------------------------------------------------------------------
  // CALCULATION METHODS
  // -------------------------------------------------------------------------
  const calculateCompletion = useCallback((): number => {
    let points = 0;
    let maxPoints = 0;

    // Lessons: 30 points each (90 total)
    Object.values(progress.lessons).forEach((lesson) => {
      maxPoints += 30;
      if (lesson.completed) {
        points += 30;
      } else {
        points += (lesson.percentComplete / 100) * 30;
      }
    });

    // Stats: 10 points for simulations, 10 for devices (20 total)
    maxPoints += 20;
    points += Math.min(progress.stats.simulationsRun / 5, 1) * 10;
    points += Math.min(progress.stats.devicesViewed / 6, 1) * 10;

    // Achievements: 5 points each (40 total max, but not required for 100%)
    // Bonus points, don't count toward max
    points += progress.achievements.length * 2;

    return Math.round((points / maxPoints) * 100);
  }, [progress]);

  const getRecommendedNext = useCallback((): JourneyMilestone | null => {
    // Find first incomplete milestone
    for (const milestone of JOURNEY_MILESTONES) {
      if (milestone.id === "ready") continue;

      const lesson = progress.lessons[milestone.id as LessonId];
      if (!lesson.completed) {
        return milestone;
      }
    }

    // All lessons complete, return "Ready"
    return JOURNEY_MILESTONES.find((m) => m.id === "ready") || null;
  }, [progress.lessons]);

  // -------------------------------------------------------------------------
  // UTILITY METHODS
  // -------------------------------------------------------------------------
  const updateLastVisited = useCallback(
    (path: string) => {
      setProgress((prev) => ({
        ...prev,
        lastVisited: path,
        stats: {
          ...prev.stats,
          lastVisit: Date.now(),
        },
      }));
    },
    [setProgress]
  );

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS_STATE);
  }, [setProgress]);

  // -------------------------------------------------------------------------
  // RETURN
  // -------------------------------------------------------------------------
  return useMemo(
    () => ({
      progress,
      isLoaded,
      lessons: progress.lessons,
      stats: progress.stats,
      achievements: progress.achievements,
      savedConfigs: progress.savedConfigs,
      completeLesson,
      updateLessonProgress,
      viewLessonSection,
      incrementStat,
      viewDevice,
      saveConfig,
      deleteConfig,
      checkAchievements,
      calculateCompletion,
      getRecommendedNext,
      updateLastVisited,
      resetProgress,
    }),
    [
      progress,
      isLoaded,
      completeLesson,
      updateLessonProgress,
      viewLessonSection,
      incrementStat,
      viewDevice,
      saveConfig,
      deleteConfig,
      checkAchievements,
      calculateCompletion,
      getRecommendedNext,
      updateLastVisited,
      resetProgress,
    ]
  );
}
