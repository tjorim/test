import { useEffect, useState } from 'react';

/**
 * Simple localStorage hook for persisting state.
 *
 * This hook synchronizes React state with localStorage, providing automatic
 * persistence across browser sessions. Updates to localStorage in other tabs
 * are automatically reflected in the app.
 *
 * @param key - The localStorage key (should use 'worktime_' prefix)
 * @param initialValue - The initial value if nothing is stored
 * @returns [value, setValue] tuple similar to useState
 *
 * @example
 * // For user preferences
 * const [theme, setTheme] = useLocalStorage('worktime_theme', 'light');
 *
 * // For app state
 * const [onboarding, setOnboarding] = useLocalStorage('worktime_onboarding', false);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      // Return initial value if localStorage is corrupted or unavailable
      return initialValue;
    }
  });

  // Listen for changes to this key in other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          // Ignore parsing errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Update state
      setStoredValue(valueToStore);

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch {
          // Handle storage quota exceeded or other localStorage errors silently
          // App continues to function normally even if storage fails
        }
      }
    } catch {
      // Handle any other errors silently - app continues to function
    }
  };

  return [storedValue, setValue];
}
