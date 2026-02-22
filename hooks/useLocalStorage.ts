"use client";

import { useState, useEffect, useCallback } from "react";
import { LocalStorageReturn, UseLocalStorageOptions } from "@/types";

/**
 * Custom hook for managing localStorage with type safety
 * @param options - Configuration including key, initial value, and optional serializers
 * @returns Object containing the stored value and setter functions
 */
export function useLocalStorage<T>(
  options: UseLocalStorageOptions<T>
): LocalStorageReturn<T> {
  const {
    key,
    initialValue,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize state with a function to avoid unnecessary localStorage reads
  const [value, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (deserialize(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sync state with localStorage
  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          newValue instanceof Function ? newValue(value) : newValue;
        
        setStoredValue(valueToStore);
        
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, serialize(valueToStore));
          
          // Dispatch custom event for cross-tab synchronization
          window.dispatchEvent(
            new StorageEvent("storage", {
              key,
              newValue: serialize(valueToStore),
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serialize, value]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Mark as loaded after first client-side render
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(deserialize(event.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage change for "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, deserialize]);

  return { value, setValue, removeValue, isLoaded };
}

/**
 * Hook for managing multiple localStorage items
 */
export function useLocalStorageMulti<T extends Record<string, unknown>>(
  initialValues: T
): {
  values: T;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  removeValue: (key: keyof T) => void;
  resetAll: () => void;
} {
  const [values, setValues] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValues;
    }

    const stored: Partial<T> = {};
    
    for (const key of Object.keys(initialValues)) {
      try {
        const item = window.localStorage.getItem(key as string);
        if (item) {
          stored[key as keyof T] = JSON.parse(item);
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
      }
    }
    
    return { ...initialValues, ...stored };
  });

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(key as string, JSON.stringify(value));
        } catch (error) {
          console.warn(`Error setting localStorage key "${String(key)}":`, error);
        }
      }
      
      return next;
    });
  }, []);

  const removeValue = useCallback((key: keyof T) => {
    setValues((prev) => {
      const next = { ...prev };
      delete next[key];
      
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(key as string);
        } catch (error) {
          console.warn(`Error removing localStorage key "${String(key)}":`, error);
        }
      }
      
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setValues(initialValues);
    
    if (typeof window !== "undefined") {
      for (const key of Object.keys(initialValues)) {
        try {
          window.localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Error removing localStorage key "${key}":`, error);
        }
      }
    }
  }, [initialValues]);

  return { values, setValue, removeValue, resetAll };
}
