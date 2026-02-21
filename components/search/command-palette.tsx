"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  X, 
  Cpu, 
  BookOpen, 
  Calculator, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Command,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getSearchEngine, SearchResult, trackEvent } from "@/lib/search";

// ============================================================================
// Types
// ============================================================================

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchGroup = "results" | "recent" | "popular";

interface GroupedResults {
  group: SearchGroup;
  title: string;
  items: SearchResult[] | string[];
}

// ============================================================================
// Icon Mapping
// ============================================================================

const typeIcons: Record<SearchResult["type"], typeof Cpu> = {
  hardware: Cpu,
  article: BookOpen,
  tool: Calculator,
};

const typeColors: Record<SearchResult["type"], string> = {
  hardware: "text-primary",
  article: "text-secondary",
  tool: "text-accent",
};

// ============================================================================
// Component
// ============================================================================

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<string[]>([
    "bitaxe",
    "solo mining",
    "pool mining",
    "profitability",
    "sha256",
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchEngine = getSearchEngine();

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setRecentSearches(searchEngine.getRecentSearches());
      setSelectedIndex(0);
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, searchEngine]);

  // Handle search
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchEngine.search(query, 8);
      setResults(searchResults);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query, searchEngine]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // Toggle through a callback prop or global state
          // For now, we just handle close here
        } else {
          onClose();
        }
      }

      if (!isOpen) return;

      const allItems = getAllItems();

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev < allItems.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev > 0 ? prev - 1 : allItems.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          const selected = getSelectedItem();
          if (selected) {
            handleSelect(selected);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, query, results, recentSearches]);

  const getAllItems = (): (SearchResult | string)[] => {
    if (query.trim()) {
      return results;
    }
    return [...recentSearches, ...popularSearches];
  };

  const getSelectedItem = (): SearchResult | string | null => {
    const all = getAllItems();
    return all[selectedIndex] || null;
  };

  const handleSelect = (item: SearchResult | string) => {
    if (typeof item === "string") {
      // It's a search suggestion
      setQuery(item);
      searchEngine.saveSearch(item);
      trackEvent("Search", { query: item });
    } else {
      // It's a search result
      searchEngine.saveSearch(query || item.title);
      router.push(item.href);
      trackEvent("Search Result Click", { 
        query: query || item.title,
        result_type: item.type,
        result_id: item.id,
      });
      onClose();
    }
  };

  const clearRecent = () => {
    searchEngine.clearHistory();
    setRecentSearches([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed inset-x-4 top-[20%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50"
          >
            <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search hardware, guides, tools..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-2 py-1">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.trim() ? (
                  // Search Results
                  results.length > 0 ? (
                    <div className="py-2">
                      {results.map((result, index) => {
                        const Icon = typeIcons[result.type];
                        const isSelected = selectedIndex === index;

                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={cn(
                              "w-full px-4 py-3 flex items-start gap-3 text-left transition-colors",
                              isSelected && "bg-muted"
                            )}
                          >
                            <div className={cn("mt-0.5", typeColors[result.type])}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{result.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {result.description}
                              </p>
                              <div className="flex gap-1 mt-1">
                                {result.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <ArrowRight className={cn(
                              "w-4 h-4 text-muted-foreground opacity-0 transition-opacity",
                              isSelected && "opacity-100"
                            )} />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No results found for "{query}"</p>
                      <p className="text-sm mt-1">Try a different search term</p>
                    </div>
                  )
                ) : (
                  // Default View - Recent and Popular
                  <div className="py-2">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <>
                        <div className="flex items-center justify-between px-4 py-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            Recent
                          </div>
                          <button
                            onClick={clearRecent}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </button>
                        </div>
                        {recentSearches.map((search, index) => (
                          <button
                            key={search}
                            onClick={() => handleSelect(search)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={cn(
                              "w-full px-4 py-2 flex items-center gap-3 text-left transition-colors",
                              selectedIndex === index && "bg-muted"
                            )}
                          >
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{search}</span>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Popular Searches */}
                    <div className="flex items-center gap-2 px-4 py-2 mt-2">
                      <TrendingUp className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Popular
                      </span>
                    </div>
                    {popularSearches.map((search, index) => {
                      const offset = recentSearches.length;
                      return (
                        <button
                          key={search}
                          onClick={() => handleSelect(search)}
                          onMouseEnter={() => setSelectedIndex(offset + index)}
                          className={cn(
                            "w-full px-4 py-2 flex items-center gap-3 text-left transition-colors",
                            selectedIndex === offset + index && "bg-muted"
                          )}
                        >
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span>{search}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/50 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↑↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↵</kbd>
                    to select
                  </span>
                </div>
                <span>{results.length} results</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Search Button Component
// ============================================================================

interface SearchButtonProps {
  onClick: () => void;
  className?: string;
}

export function SearchButton({ onClick, className }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg",
        "bg-muted hover:bg-muted/80 border border-border",
        "text-sm text-muted-foreground transition-colors",
        className
      )}
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background text-xs">
        <Command className="w-3 h-3" />
        <span>K</span>
      </kbd>
    </button>
  );
}

// Plausible analytics types
type PlausibleEvent = "Search" | "Search Result Click";

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean>; callback?: () => void }) => void;
  }
}
