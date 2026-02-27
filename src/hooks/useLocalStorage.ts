import { useState, useEffect } from 'react';

const STORAGE_KEY = 'meeting-bingo-game-state';

export function useLocalStorage<T>(initialValue: T): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedValue));
    } catch {
      // Quota exceeded or private mode — silently ignore
    }
  }, [storedValue]);

  function clearStorage() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setStoredValue(initialValue);
  }

  return [storedValue, setStoredValue, clearStorage];
}
