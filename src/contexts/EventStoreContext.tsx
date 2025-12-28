/**
 * Event Store Context
 *
 * Manages time-off events from .hday files with CRUD operations and localStorage persistence.
 * Provides a centralized store for holiday/time-off events across the application.
 */

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { HdayEvent } from '../lib/hday/types';
import { parseHday, sortEvents, toLine } from '../lib/hday/parser';
import { hdayToCalendarEvents, filterEventsInRange } from '../lib/events/converters';
import type { CalendarEvent } from '../lib/events/types';
import { dayjs } from '../utils/dateTimeUtils';

const STORAGE_KEY = 'worktime_hday_raw';

interface EventStoreContextType {
  /** Raw .hday text content */
  rawText: string;

  /** Parsed .hday events */
  events: HdayEvent[];

  /** Get calendar events within a date range */
  getEventsInRange: (startDate: Date, endDate: Date) => CalendarEvent[];

  /** Add a new event */
  addEvent: (event: HdayEvent) => void;

  /** Update an existing event by index */
  updateEvent: (index: number, event: HdayEvent) => void;

  /** Delete an event by index */
  deleteEvent: (index: number) => void;

  /** Import .hday text (replaces all events) */
  importHday: (text: string) => void;

  /** Export current events as .hday text */
  exportHday: () => string;

  /** Clear all events */
  clearAll: () => void;
}

const EventStoreContext = createContext<EventStoreContextType | undefined>(undefined);

interface EventStoreProviderProps {
  children: ReactNode;
}

/**
 * Event Store Provider
 *
 * Provides event storage and management for time-off events.
 * All data is persisted to localStorage with no consent checks (internal users only).
 */
export function EventStoreProvider({ children }: EventStoreProviderProps) {
  // Load raw text from localStorage on mount
  const [rawText, setRawText] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  // Parse events from raw text
  const events = useMemo(() => {
    if (!rawText.trim()) return [];
    try {
      return parseHday(rawText);
    } catch (error) {
      console.error('Failed to parse .hday content:', error);
      return [];
    }
  }, [rawText]);

  // Persist to localStorage whenever rawText changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (rawText.trim()) {
        localStorage.setItem(STORAGE_KEY, rawText);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save .hday content to localStorage:', error);
    }
  }, [rawText]);

  /**
   * Get calendar events within a date range
   */
  const getEventsInRange = useCallback(
    (startDate: Date, endDate: Date): CalendarEvent[] => {
      const calendarEvents: CalendarEvent[] = [];

      events.forEach((event, index) => {
        const converted = hdayToCalendarEvents(event, startDate, endDate, index);
        calendarEvents.push(...converted);
      });

      // Filter to only include events that overlap with the date range
      const startStr = dayjs(startDate).format('YYYY-MM-DD');
      const endStr = dayjs(endDate).format('YYYY-MM-DD');
      return filterEventsInRange(calendarEvents, startStr, endStr);
    },
    [events],
  );

  /**
   * Add a new event
   */
  const addEvent = useCallback((event: HdayEvent) => {
    setRawText((prevRawText) => {
      const prevEvents = prevRawText.trim() ? parseHday(prevRawText) : [];
      const newEvents = [...prevEvents, event];
      const sorted = sortEvents(newEvents);
      return sorted.map((e) => toLine(e)).join('\n');
    });
  }, []);

  /**
   * Update an existing event by index
   */
  const updateEvent = useCallback((index: number, event: HdayEvent) => {
    setRawText((prevRawText) => {
      const prevEvents = prevRawText.trim() ? parseHday(prevRawText) : [];

      if (index < 0 || index >= prevEvents.length) {
        console.error(`Invalid event index: ${index}`);
        return prevRawText;
      }

      const newEvents = [...prevEvents];
      newEvents[index] = event;
      const sorted = sortEvents(newEvents);
      return sorted.map((e) => toLine(e)).join('\n');
    });
  }, []);

  /**
   * Delete an event by index
   */
  const deleteEvent = useCallback((index: number) => {
    setRawText((prevRawText) => {
      const prevEvents = prevRawText.trim() ? parseHday(prevRawText) : [];

      if (index < 0 || index >= prevEvents.length) {
        console.error(`Invalid event index: ${index}`);
        return prevRawText;
      }

      const newEvents = prevEvents.filter((_, i) => i !== index);
      const sorted = sortEvents(newEvents);
      return sorted.map((e) => toLine(e)).join('\n');
    });
  }, []);

  /**
   * Import .hday text (replaces all events)
   */
  const importHday = useCallback((text: string) => {
    setRawText(text);
  }, []);

  /**
   * Export current events as .hday text
   */
  const exportHday = useCallback(() => {
    return rawText;
  }, [rawText]);

  /**
   * Clear all events
   */
  const clearAll = useCallback(() => {
    setRawText('');
  }, []);

  const contextValue: EventStoreContextType = useMemo(
    () => ({
      rawText,
      events,
      getEventsInRange,
      addEvent,
      updateEvent,
      deleteEvent,
      importHday,
      exportHday,
      clearAll,
    }),
    [
      rawText,
      events,
      getEventsInRange,
      addEvent,
      updateEvent,
      deleteEvent,
      importHday,
      exportHday,
      clearAll,
    ],
  );

  return <EventStoreContext.Provider value={contextValue}>{children}</EventStoreContext.Provider>;
}

/**
 * Hook to access event store context
 * Must be used within an EventStoreProvider
 */
export function useEventStore(): EventStoreContextType {
  const context = useContext(EventStoreContext);
  if (context === undefined) {
    throw new Error('useEventStore must be used within an EventStoreProvider');
  }
  return context;
}
