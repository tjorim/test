/**
 * Date validation utilities for the .hday format (YYYY/MM/DD)
 */

import { dayjs } from '../../utils/dateTimeUtils';

const DATE_FORMAT_REGEX = /^\d{4}\/\d{2}\/\d{2}$/;

/**
 * Validates a date string in YYYY/MM/DD format.
 *
 * Checks both format (via regex) and whether the date is valid
 * (e.g., rejects Feb 30, April 31, invalid months like 13, etc.)
 *
 * @param dateString Date in YYYY/MM/DD format
 * @returns true if the date is valid, false otherwise
 *
 * @example
 * isValidDate('2025/12/25') // true
 * isValidDate('2025/02/30') // false (Feb doesn't have 30 days)
 * isValidDate('2025-12-25') // false (wrong separator)
 */
export function isValidDate(dateString: string): boolean {
  if (!DATE_FORMAT_REGEX.test(dateString)) {
    return false;
  }
  // Parse using dayjs strict mode and verify it round-trips correctly
  const parsed = dayjs(dateString, 'YYYY/MM/DD', true);
  return parsed.isValid() && parsed.format('YYYY/MM/DD') === dateString;
}

/**
 * Parse a date string in YYYY/MM/DD format into a Date object in the local timezone.
 * Returns null if the input is invalid.
 *
 * @param dateString - A date string formatted as `YYYY/MM/DD`. Must represent a valid calendar date.
 * @returns A Date representing the given date in the local timezone, or null if invalid.
 */
export function parseHdayDate(dateString: string): Date | null {
  const parsed = dayjs(dateString, 'YYYY/MM/DD', true);
  if (!parsed.isValid()) {
    return null;
  }
  return parsed.toDate();
}
