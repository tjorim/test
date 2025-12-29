import type { Dayjs } from "dayjs";
import { CONFIG } from "./config";
import { dayjs, formatYYWWD } from "./dateTimeUtils";

export type ShiftType = "M" | "E" | "N" | "O";

export interface Shift {
  code: ShiftType;
  name: string;
  hours: string;
  start: number | null;
  end: number | null;
  isWorking: boolean;
  className: string;
}

export interface ShiftResult {
  date: Dayjs;
  shift: Shift;
  code: string;
  teamNumber: number;
}

export interface UpcomingShiftResult {
  date: Dayjs;
  shift: Shift;
  code: string;
}

export interface OffDayProgress {
  current: number;
  total: number;
}

// Shift definitions
export const SHIFTS = Object.freeze({
  MORNING: Object.freeze({
    code: "M",
    emoji: "🌅",
    name: "Morning",
    hours: "07:00-15:00",
    start: 7,
    end: 15,
    isWorking: true,
    className: "shift-morning",
  }),
  EVENING: Object.freeze({
    code: "E",
    emoji: "🌆",
    name: "Evening",
    hours: "15:00-23:00",
    start: 15,
    end: 23,
    isWorking: true,
    className: "shift-evening",
  }),
  NIGHT: Object.freeze({
    code: "N",
    emoji: "🌙",
    name: "Night",
    hours: "23:00-07:00",
    start: 23,
    end: 7,
    isWorking: true,
    className: "shift-night",
  }),
  OFF: Object.freeze({
    code: "O",
    emoji: "🏠",
    name: "Off",
    hours: "Not working",
    start: null,
    end: null,
    isWorking: false,
    className: "shift-off",
  }),
});

/**
 * Combine a shift's emoji and name into a single display label.
 *
 * @param shift - The shift object whose emoji and name will be used
 * @returns The display string in the form "`<emoji> <name>`"
 */
export function getShiftDisplayName(shift: ReturnType<typeof getShiftByCode>): string {
  return `${shift.emoji} ${shift.name}`;
}

/**
 * Retrieve a shift definition for a given shift code, returning an 'Unknown' shift object when no match is found.
 *
 * @param code - Shift code to look up; may be null or undefined
 * @returns The matching shift object from `SHIFTS`, or a fallback object with code `'U'`, emoji `❓`, name `'Unknown'`, non-working flags and null times when no match exists
 */
export function getShiftByCode(code: string | null | undefined) {
  const shift = Object.values(SHIFTS).find((s) => s.code === code);
  return (
    shift || {
      code: "U",
      emoji: "❓",
      name: "Unknown",
      hours: "Unknown hours",
      start: null,
      end: null,
      isWorking: false,
      className: "shift-off",
    }
  );
}

/**
 * Determine the scheduled shift for a team on a given date.
 *
 * @param date - Date to evaluate (string, Date or Dayjs)
 * @param teamNumber - Team index starting at 1; must be between 1 and CONFIG.TEAMS_COUNT
 * @returns The Shift object for that team and date (one of MORNING, EVENING, NIGHT or OFF)
 * @throws Error - If `teamNumber` is outside the range 1..CONFIG.TEAMS_COUNT
 */
export function calculateShift(date: string | Date | Dayjs, teamNumber: number): Shift {
  // Validate team number
  if (teamNumber < 1 || teamNumber > CONFIG.TEAMS_COUNT) {
    throw new Error(`Invalid team number: ${teamNumber}. Expected 1-${CONFIG.TEAMS_COUNT}`);
  }

  const targetDate = dayjs(date).startOf("day");
  const referenceDate = dayjs(CONFIG.REFERENCE_DATE).startOf("day");

  // Calculate days since reference
  const daysSinceReference = targetDate.diff(referenceDate, "day");

  // Calculate team offset (each team starts 2 days later)
  const teamOffset = (teamNumber - CONFIG.REFERENCE_TEAM) * 2;

  // Calculate position in 10-day cycle
  const adjustedDays = daysSinceReference - teamOffset;
  const cyclePosition =
    ((adjustedDays % CONFIG.SHIFT_CYCLE_DAYS) + CONFIG.SHIFT_CYCLE_DAYS) % CONFIG.SHIFT_CYCLE_DAYS;

  // Determine shift based on cycle position
  if (cyclePosition < 2) {
    return SHIFTS.MORNING;
  }
  if (cyclePosition < 4) {
    return SHIFTS.EVENING;
  }
  if (cyclePosition < 6) {
    return SHIFTS.NIGHT;
  }
  return SHIFTS.OFF;
}

/**
 * Map a timestamp to the shift's effective day, assigning times before 07:00 to the previous calendar day.
 *
 * @param date - The date or timestamp to evaluate
 * @returns The Dayjs representing the shift day (the previous day if `date` is before 07:00)
 */
export function getCurrentShiftDay(date: string | Date | Dayjs): Dayjs {
  const current = dayjs(date);
  const hour = current.hour();

  // If it's before 7 AM, we're in the previous day's night shift
  if (hour < 7) {
    return current.subtract(1, "day");
  }

  return current;
}

/**
 * Generate the shift code for a given date and team, using the previous calendar day for night shifts.
 *
 * @param date - The date to evaluate (string, Date or Dayjs); night shifts map to the prior calendar day for code generation
 * @param teamNumber - The team number
 * @returns The shift code in the format YYWW.DX (for example, "2520.2M")
 */
export function getShiftCode(date: string | Date | Dayjs, teamNumber: number): string {
  const shift = calculateShift(date, teamNumber);
  let codeDate = dayjs(date);

  // For night shifts, use the previous day's date code
  if (shift.code === "N") {
    codeDate = codeDate.subtract(1, "day");
  }

  // Inline formatDateCode logic
  const dateCode = formatYYWWD(codeDate);
  return `${dateCode}${shift.code}`;
}

/**
 * Locate the next working shift for a team after a given date.
 *
 * @param fromDate - Date to start the search from (exclusive)
 * @param teamNumber - Team identifier; must be between 1 and CONFIG.TEAMS_COUNT
 * @returns The upcoming shift result containing `date`, `shift` and `code`, or `null` if no working shift is found within the shift cycle
 */
export function getNextShift(
  fromDate: string | Date | Dayjs,
  teamNumber: number,
): UpcomingShiftResult | null {
  // Validate team number range
  if (teamNumber < 1 || teamNumber > CONFIG.TEAMS_COUNT) {
    return null;
  }

  let checkDate = dayjs(fromDate).add(1, "day");

  for (let i = 0; i < CONFIG.SHIFT_CYCLE_DAYS; i++) {
    const shift = calculateShift(checkDate, teamNumber);
    if (shift.isWorking) {
      return {
        date: checkDate,
        shift: shift,
        code: getShiftCode(checkDate, teamNumber),
      };
    }
    checkDate = checkDate.add(1, "day");
  }

  return null;
}

/**
 * Return the shift assignment for every team on the given date.
 *
 * @param date - The reference date (string, Date or Dayjs) for which to compute each team's shift
 * @returns An array of ShiftResult objects where each item contains the provided date as a Dayjs, the team's shift, the shift code and the team number
 */
export function getAllTeamsShifts(date: string | Date | Dayjs): ShiftResult[] {
  const results: ShiftResult[] = [];

  for (let teamNumber = 1; teamNumber <= CONFIG.TEAMS_COUNT; teamNumber++) {
    const shift = calculateShift(date, teamNumber);
    const code = getShiftCode(date, teamNumber);

    results.push({
      date: dayjs(date),
      shift,
      code,
      teamNumber,
    });
  }

  return results;
}

/**
 * Determine which day of a team's four-day off period the given date falls on.
 *
 * @param date - Date to evaluate (string | Date | Dayjs)
 * @param teamNumber - 1-based team index; must be between 1 and CONFIG.TEAMS_COUNT
 * @returns `OffDayProgress` with `current` and `total` (`total` is 4) if the team is currently on an off day, `null` if the team is working or `teamNumber` is out of range
 */
export function getOffDayProgress(
  date: string | Date | Dayjs,
  teamNumber: number,
): OffDayProgress | null {
  // Validate team number
  if (teamNumber < 1 || teamNumber > CONFIG.TEAMS_COUNT) {
    return null;
  }

  const currentShift = calculateShift(date, teamNumber);

  // Only calculate for teams that are off
  if (currentShift.isWorking) {
    return null;
  }

  // Team is off, calculate which day of their 4-day break
  let dayCount = 0;
  let checkDate = getCurrentShiftDay(dayjs(date));

  // Look backwards to find when this off period started
  for (let i = 0; i < CONFIG.SHIFT_CYCLE_DAYS; i++) {
    // Max 10 days to avoid infinite loop
    const shift = calculateShift(checkDate, teamNumber);
    if (shift.isWorking) {
      break; // Found the last working day
    }
    dayCount++;
    checkDate = checkDate.subtract(1, "day");
  }

  return dayCount > 0 ? { current: dayCount, total: 4 } : null;
}

/**
 * Determine whether the given shift is active at the specified reference time for its assigned date.
 *
 * @param shift - Object containing `code` and `start`/`end` hour values; `start` and `end` are hours in 0–23 or `null` when not applicable
 * @param date - The shift's assigned date (Dayjs)
 * @param currentTime - The reference time used to decide activity and to align to the shift's effective day
 * @returns `true` if the shift is active at `currentTime` for `date`, `false` otherwise
 */
export function isCurrentlyWorking(
  shift: { code: string; start: number | null; end: number | null },
  date: Dayjs,
  currentTime: Dayjs,
): boolean {
  // Explicitly check for null/undefined to handle midnight (0) as a valid start time
  if (shift.start == null || shift.end == null) return false;

  const shiftDay = getCurrentShiftDay(currentTime);
  if (!shiftDay.isSame(date, "day")) return false;

  const hour = currentTime.hour();

  // Detect shifts spanning midnight by comparing start/end hours (more robust than checking shift code)
  if (shift.start > shift.end) {
    return hour >= shift.start || hour < shift.end;
  }

  return hour >= shift.start && hour < shift.end;
}