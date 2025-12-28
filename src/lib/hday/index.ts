/**
 * .hday parsing library
 *
 * Provides parsing, validation, and utilities for working with .hday time-off event files.
 */

// Re-export types
export type { EventFlag, HdayEvent, TimeLocationFlag, TypeFlag } from './types';

// Re-export parser functions
export {
  buildPreviewLine,
  EVENT_COLORS,
  getEventClass,
  getEventColor,
  getEventTypeLabel,
  getTimeLocationSymbol,
  normalizeEventFlags,
  parseHday,
  sortEvents,
  toLine,
} from './parser';

// Re-export validation functions
export { isValidDate, parseHdayDate } from './validation';
