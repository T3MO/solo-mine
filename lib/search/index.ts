/**
 * Client-Side Search
 * Fuse.js-based fuzzy search for hardware and educational content
 */

import Fuse from "fuse.js";
import hardwareData from "@/data/hardware.json";

// ============================================================================
// Types
// ============================================================================

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "hardware" | "article" | "tool";
  href: string;
  image?: string;
  tags: string[];
  priority: number;
}

export interface SearchIndex {
  hardware: SearchResult[];
  articles: SearchResult[];
  tools: SearchResult[];
}

// ============================================================================
// Search Index Construction
// ============================================================================

function buildHardwareIndex(): SearchResult[] {
  return hardwareData.devices.map((device) => ({
    id: device.id,
    title: device.name,
    description: device.description,
    type: "hardware" as const,
    href: `/hardware/${device.id}`,
    image: device.image,
    tags: [
      device.category,
      device.type,
      ...(device.tags || []),
      device.brand,
    ].filter(Boolean),
    priority: 1,
  }));
}

function buildArticleIndex(): SearchResult[] {
  return [
    {
      id: "sha256",
      title: "SHA-256 Explained",
      description: "Understand the cryptographic hash function that powers Bitcoin mining. Interactive visualizer included.",
      type: "article" as const,
      href: "/learn/sha256",
      tags: ["cryptography", "hashing", "bitcoin", "mining", "education"],
      priority: 2,
    },
    {
      id: "pool-vs-solo",
      title: "Pool vs Solo Mining",
      description: "Compare the pros and cons of mining in a pool versus solo mining. Which strategy is right for you?",
      type: "article" as const,
      href: "/learn/pool-vs-solo",
      tags: ["strategy", "pool", "solo", "mining", "variance"],
      priority: 2,
    },
    {
      id: "profitability",
      title: "Mining Profitability Guide",
      description: "Learn how to calculate mining profitability. Understand electricity costs, difficulty, and ROI.",
      type: "article" as const,
      href: "/learn/profitability",
      tags: ["profit", "roi", "electricity", "difficulty", "guide"],
      priority: 2,
    },
    {
      id: "hardware-selection",
      title: "How to Choose a Miner",
      description: "What to look for when selecting Bitcoin mining hardware. Hashrate, efficiency, noise, and more.",
      type: "article" as const,
      href: "/learn/hardware-selection",
      tags: ["hardware", "asic", "hashrate", "efficiency", "noise"],
      priority: 2,
    },
    {
      id: "beginners-guide",
      title: "Bitcoin Mining for Beginners",
      description: "Everything you need to know to start mining Bitcoin at home. From setup to first payout.",
      type: "article" as const,
      href: "/learn/beginners-guide",
      tags: ["beginner", "setup", "guide", "tutorial", "start"],
      priority: 3,
    },
  ];
}

function buildToolsIndex(): SearchResult[] {
  return [
    {
      id: "variance-simulator",
      title: "Mining Simulator",
      description: "Simulate 365 days of mining with real Bitcoin difficulty data. Compare pool vs solo strategies.",
      type: "tool" as const,
      href: "/tools/variance-simulator",
      tags: ["simulator", "calculator", "pool", "solo", "profit"],
      priority: 1,
    },
    {
      id: "sha256-visualizer",
      title: "SHA-256 Visualizer",
      description: "Interactive tool to visualize SHA-256 hashing. Understand how Bitcoin blocks are mined.",
      type: "tool" as const,
      href: "/learn/sha256",
      tags: ["visualizer", "sha256", "hash", "interactive", "demo"],
      priority: 2,
    },
    {
      id: "eligibility-quiz",
      title: "Should I Mine? Quiz",
      description: "Answer 5 questions to find out if Bitcoin mining is right for you.",
      type: "tool" as const,
      href: "/quiz",
      tags: ["quiz", "eligibility", "assessment", "recommendation"],
      priority: 1,
    },
  ];
}

// ============================================================================
// Fuse.js Configuration
// ============================================================================

const FUSE_OPTIONS = {
  keys: [
    { name: "title", weight: 2 },
    { name: "description", weight: 1.5 },
    { name: "tags", weight: 1 },
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: true,
  ignoreLocation: true,
};

// ============================================================================
// Search Engine
// ============================================================================

class SearchEngine {
  private fuse: Fuse<SearchResult>;
  private index: SearchResult[];

  constructor() {
    this.index = [
      ...buildHardwareIndex(),
      ...buildArticleIndex(),
      ...buildToolsIndex(),
    ];
    this.fuse = new Fuse(this.index, FUSE_OPTIONS);
  }

  search(query: string, limit = 10): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    const results = this.fuse.search(query, { limit });
    
    // Sort by score and priority
    return results
      .map((result) => ({
        ...result.item,
        // Adjust score based on priority (lower score = better match)
        _adjustedScore: (result.score || 1) / result.item.priority,
      }))
      .sort((a, b) => (a as unknown as { _adjustedScore: number })._adjustedScore - (b as unknown as { _adjustedScore: number })._adjustedScore)
      .slice(0, limit)
      .map(({ ...rest }) => rest as unknown as SearchResult);
  }

  getSuggestions(query: string, limit = 5): string[] {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const results = this.fuse.search(query, { limit });
    
    // Extract unique terms from titles
    const suggestions = new Set<string>();
    results.forEach((result) => {
      const title = result.item.title;
      // Add full title
      suggestions.add(title);
      // Add partial matches
      const words = title.toLowerCase().split(" ");
      words.forEach((word) => {
        if (word.startsWith(query.toLowerCase())) {
          suggestions.add(word);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  getRecentSearches(): string[] {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = localStorage.getItem("solo-mine-search-history");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  }

  saveSearch(query: string) {
    if (typeof window === "undefined" || !query.trim()) {
      return;
    }

    try {
      const recent = this.getRecentSearches();
      const updated = [query, ...recent.filter((q) => q !== query)].slice(0, 5);
      localStorage.setItem("solo-mine-search-history", JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  clearHistory() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.removeItem("solo-mine-search-history");
    } catch {
      // Ignore storage errors
    }
  }

  // Get popular/trending searches (static for now, could be dynamic)
  getPopularSearches(): string[] {
    return [
      "bitaxe",
      "solo mining",
      "pool mining",
      "profitability",
      "sha256",
    ];
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let searchEngine: SearchEngine | null = null;

export function getSearchEngine(): SearchEngine {
  if (!searchEngine) {
    searchEngine = new SearchEngine();
  }
  return searchEngine;
}

// ============================================================================
// Utility Exports
// ============================================================================

export { buildHardwareIndex, buildArticleIndex, buildToolsIndex };
export type { Fuse };
