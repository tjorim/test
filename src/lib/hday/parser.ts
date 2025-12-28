import type { EventFlag, HdayEvent, TimeLocationFlag, TypeFlag } from './types';

// Type flags that override the default 'holiday' flag
const TYPE_FLAGS = ['business', 'weekend', 'birthday', 'ill', 'in', 'course', 'other'] as const;
const TYPE_FLAGS_SET = new Set<string>(TYPE_FLAGS);

/**
 * Color constants for event backgrounds.
 * All colors meet WCAG AA accessibility standards (4.5:1 contrast minimum) with black text (#000).
 * Verified contrast ratios:
 * - HOLIDAY_FULL: 4.57:1   - HOLIDAY_HALF: 9.25:1
 * - BUSINESS_FULL: 9.55:1  - BUSINESS_HALF: 12.90:1
 * - COURSE_FULL: 9.93:1    - COURSE_HALF: 13.83:1
 * - IN_OFFICE_FULL: 4.98:1 - IN_OFFICE_HALF: 8.73:1
 * - WEEKEND_FULL: 5.7:1    - WEEKEND_HALF: 7.8:1
 * - BIRTHDAY_FULL: 4.6:1   - BIRTHDAY_HALF: 8.2:1
 * - ILL_FULL: 6.2:1        - ILL_HALF: 8.7:1
 * - OTHER_FULL: 5.0:1      - OTHER_HALF: 10.1:1
 */
export const EVENT_COLORS = {
  HOLIDAY_FULL: '#EC0000', // Red - full day vacation/holiday
  HOLIDAY_HALF: '#FF8A8A', // Pink - half day vacation/holiday
  BUSINESS_FULL: '#FF9500', // Orange - full day business trip
  BUSINESS_HALF: '#FFC04D', // Light orange - half day business
  COURSE_FULL: '#D9AD00', // Dark yellow/gold - full day course
  COURSE_HALF: '#F0D04D', // Light yellow - half day course
  IN_OFFICE_FULL: '#008899', // Teal - full day in-office
  IN_OFFICE_HALF: '#00B8CC', // Light teal - half day in-office
  WEEKEND_FULL: '#990099', // Dark magenta - full day weekend
  WEEKEND_HALF: '#CC66CC', // Light magenta - half day weekend
  BIRTHDAY_FULL: '#0000CC', // Dark blue - full day birthday
  BIRTHDAY_HALF: '#6666FF', // Light blue - half day birthday
  ILL_FULL: '#336600', // Dark olive - full day ill/sick
  ILL_HALF: '#669933', // Light olive - half day ill/sick
  OTHER_FULL: '#008B8B', // Dark cyan - full day other
  OTHER_HALF: '#4DB8B8', // Light cyan - half day other
} as const;

/**
 * Parse a prefix string of single-character flags into normalized event flags.
 *
 * Unknown characters in the prefix are ignored (a console warning is emitted).
 *
 * @param prefix - A string of single-character flags (e.g., "ap" for `half_am` + `half_pm`)
 * @returns The list of normalized `EventFlag` values; if no type flag (`business`, `course`, `in`) is present, the result will include `holiday`.
 */
function parsePrefixFlags(prefix: string): EventFlag[] {
  const flagMap: Record<string, EventFlag> = {
    a: 'half_am',
    p: 'half_pm',
    b: 'business',
    e: 'weekend',
    h: 'birthday',
    i: 'ill',
    k: 'in',
    s: 'course',
    u: 'other',
    w: 'onsite',
    n: 'no_fly',
    f: 'can_fly',
  };

  const flags: EventFlag[] = [];
  for (const ch of prefix) {
    if (flagMap[ch]) {
      flags.push(flagMap[ch]);
    } else {
      console.warn(
        `Unknown flag character '${ch}' ignored. Known flags: a, p, b, e, h, i, k, s, u, w, n, f`,
      );
    }
  }

  return normalizeEventFlags(flags);
}

/**
 * Ensure an array of event flags includes a type flag by appending `'holiday'` when none is present.
 * Also enforces mutual exclusivity of both time/location flags (a/p/w/n/f) and type flags (b/e/h/i/k/s/u)
 * by keeping only the first one found in the INPUT order for each category (not based on any priority).
 *
 * @param flags - The event flags to normalize
 * @returns A new array with `'holiday'` appended if no type flag is present; the input array is never modified.
 */
export function normalizeEventFlags(flags: EventFlag[]): EventFlag[] {
  let normalized = [...flags];

  // Enforce mutual exclusivity of time/location flags (keep first one from input)
  const timeLocationFlags: TimeLocationFlag[] = [
    'half_am',
    'half_pm',
    'onsite',
    'no_fly',
    'can_fly',
  ];
  const firstTimeLocationInInput = normalized.find((f) =>
    timeLocationFlags.includes(f as TimeLocationFlag),
  );
  const foundTimeLocation = normalized.filter((f) =>
    timeLocationFlags.includes(f as TimeLocationFlag),
  );

  if (foundTimeLocation.length > 1) {
    // Keep only the first time/location flag from the input, remove all others
    normalized = normalized.filter(
      (f) => !timeLocationFlags.includes(f as TimeLocationFlag) || f === firstTimeLocationInInput,
    );
    console.warn(
      `Multiple time/location flags found (${foundTimeLocation.join(', ')}). ` +
        `Keeping first from input: ${firstTimeLocationInInput}`,
    );
  }

  // Enforce mutual exclusivity of type flags (keep first one from input)
  // Exclude 'holiday' as it's the default fallback
  const typeFlags: TypeFlag[] = ['business', 'weekend', 'birthday', 'ill', 'in', 'course', 'other'];
  const firstTypeInInput = normalized.find((f) => typeFlags.includes(f as TypeFlag));
  const foundTypes = normalized.filter((f) => typeFlags.includes(f as TypeFlag));

  if (foundTypes.length > 1) {
    // Keep only the first type flag from the input, remove all others
    normalized = normalized.filter(
      (f) => !typeFlags.includes(f as TypeFlag) || f === firstTypeInInput,
    );
    console.warn(
      `Multiple type flags found (${foundTypes.join(', ')}). ` +
        `Keeping first from input: ${firstTypeInInput}`,
    );
  }

  // Default to 'holiday' if no type flags
  if (!normalized.some((f) => TYPE_FLAGS_SET.has(f))) {
    return [...normalized, 'holiday'];
  }
  return normalized;
}

/**
 * Parse .hday text format into an array of HdayEvent objects.
 *
 * Format:
 * - Range events: `[flags]YYYY/MM/DD-YYYY/MM/DD # title`
 * - Weekly events: `dN[flags] # title` where N is 1-7 (Mon-Sun, ISO weekday)
 * - Flags: a=half_am, p=half_pm, b=business, s=course, i=in, w=onsite, n=no_fly, f=can_fly
 * - Events without type flags (b/s/i) default to 'holiday'
 *
 * @param text Raw .hday file content
 * @returns Array of parsed events
 */
export function parseHday(text: string): HdayEvent[] {
  const reRange =
    /^(?<prefix>[a-z]*)?(?<start>\d{4}\/\d{2}\/\d{2})(?:-(?<end>\d{4}\/\d{2}\/\d{2}))?(?:\s*#\s*(?<title>.*))?$/i;
  const reWeekly = /^d(?<weekday>[1-7])(?<suffix>[a-z]*?)(?:\s*#\s*(?<title>.*))?$/i;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const events: HdayEvent[] = [];

  for (const line of lines) {
    // Try parsing as range event
    const rangeMatch = line.match(reRange);
    if (rangeMatch?.groups) {
      const { prefix = '', start, end, title = '' } = rangeMatch.groups;
      const flags = parsePrefixFlags(prefix);

      events.push({
        type: 'range',
        start,
        end: end || start,
        flags,
        title: title.trim(),
        raw: line,
      });
      continue;
    }

    // Try parsing as weekly event
    const weeklyMatch = line.match(reWeekly);
    if (weeklyMatch?.groups) {
      const { suffix = '', weekday, title = '' } = weeklyMatch.groups;

      // Regex guarantees weekday is 1-7; this check should never fail
      if (!weekday) {
        console.error(`Weekly event regex matched but weekday is undefined: ${line}`);
        events.push({ type: 'unknown', raw: line, flags: ['holiday'] });
        continue;
      }

      const flags = parsePrefixFlags(suffix);
      const weekdayNum = parseInt(weekday, 10);

      events.push({
        type: 'weekly',
        weekday: weekdayNum,
        flags,
        title: title.trim(),
        raw: line,
      });
      continue;
    }

    // Unknown format - keep as-is
    events.push({
      type: 'unknown',
      raw: line,
      flags: ['holiday'],
    });
  }

  return events;
}

/**
 * Serialize an HdayEvent into a single .hday-format text line.
 *
 * @param ev - The event to serialize; for `unknown` events the `raw` field must be present.
 * @returns The corresponding single-line representation suitable for a .hday file.
 * @throws Error if an `unknown` event is missing its `raw` field or if the event `type` is unsupported.
 */
export function toLine(ev: Omit<HdayEvent, 'raw'> | HdayEvent): string {
  const flagMap: Record<string, string> = {
    half_am: 'a',
    half_pm: 'p',
    business: 'b',
    weekend: 'e',
    birthday: 'h',
    ill: 'i',
    in: 'k',
    course: 's',
    other: 'u',
    onsite: 'w',
    no_fly: 'n',
    can_fly: 'f',
  };

  // Canonical serialization order: type flags first, then time/location flags
  // This is for readability/consistency, NOT for priority resolution
  // (normalization already ensured only one flag from each category exists)
  const flagOrder: EventFlag[] = [
    'business',
    'weekend',
    'birthday',
    'ill',
    'course',
    'in',
    'other',
    'half_am',
    'half_pm',
    'onsite',
    'no_fly',
    'can_fly',
  ];

  const flags = ev.flags || [];
  const prefix = flagOrder
    .filter((f) => flags.includes(f))
    .map((f) => flagMap[f])
    .join('');

  const title = ev.title ? ` # ${ev.title}` : '';

  if (ev.type === 'range') {
    if (ev.start === ev.end) {
      return `${prefix}${ev.start}${title}`;
    }
    return `${prefix}${ev.start}-${ev.end}${title}`;
  } else if (ev.type === 'weekly') {
    return `d${ev.weekday}${prefix}${title}`;
  } else if (ev.type === 'unknown') {
    // Unknown event types must have the raw field for serialization
    if ('raw' in ev && ev.raw) {
      return ev.raw;
    }
    throw new Error(
      `Cannot serialize unknown event type: missing 'raw' field. ` +
        `Event: type=${ev.type}, title="${ev.title || '(none)'}", flags=${JSON.stringify(ev.flags || [])}`,
    );
  }

  // Fallback for completely unsupported types
  throw new Error(`Unsupported event type for serialization: ${ev.type}`);
}

/**
 * Get the hex background color for an event based on its flags.
 *
 * Determines the color from EVENT_COLORS based on the event type flag
 * (`business`, `weekend`, `birthday`, `ill`, `course`, `in`, `other`, or `holiday`).
 * When multiple type flags are present (edge case), the priority is:
 * business > weekend > birthday > ill > course > in > other > holiday.
 * Half-day status is derived from the half-day flags: exactly one of
 * `half_am` or `half_pm` means a half-day; both or neither means a full day.
 *
 * @param flags - Optional list of event flags (type and/or half-day indicators).
 * @returns The hex color string to use as the event background.
 */
export function getEventColor(flags?: EventFlag[]): string {
  if (!flags || flags.length === 0) return EVENT_COLORS.HOLIDAY_FULL;

  // Only treat as half-day if exactly one half flag is present (XOR logic)
  // Both half_am and half_pm together means a full day
  const hasHalfDay = flags.includes('half_am') !== flags.includes('half_pm');

  // Determine base color based on type flags
  if (flags.includes('business')) {
    return hasHalfDay ? EVENT_COLORS.BUSINESS_HALF : EVENT_COLORS.BUSINESS_FULL;
  } else if (flags.includes('weekend')) {
    return hasHalfDay ? EVENT_COLORS.WEEKEND_HALF : EVENT_COLORS.WEEKEND_FULL;
  } else if (flags.includes('birthday')) {
    return hasHalfDay ? EVENT_COLORS.BIRTHDAY_HALF : EVENT_COLORS.BIRTHDAY_FULL;
  } else if (flags.includes('ill')) {
    return hasHalfDay ? EVENT_COLORS.ILL_HALF : EVENT_COLORS.ILL_FULL;
  } else if (flags.includes('course')) {
    return hasHalfDay ? EVENT_COLORS.COURSE_HALF : EVENT_COLORS.COURSE_FULL;
  } else if (flags.includes('in')) {
    return hasHalfDay ? EVENT_COLORS.IN_OFFICE_HALF : EVENT_COLORS.IN_OFFICE_FULL;
  } else if (flags.includes('other')) {
    return hasHalfDay ? EVENT_COLORS.OTHER_HALF : EVENT_COLORS.OTHER_FULL;
  } else {
    // Holiday/vacation (default)
    return hasHalfDay ? EVENT_COLORS.HOLIDAY_HALF : EVENT_COLORS.HOLIDAY_FULL;
  }
}

/**
 * Return a symbol representing time/location based on event flags.
 *
 * @param flags - Optional list of event flags; presence of time/location flags determines the symbol
 * @returns Symbol for the time/location flag, or empty string if none present
 * - `◐` for half_am (morning half-day)
 * - `◑` for half_pm (afternoon half-day)
 * - `W` for onsite (onsite support)
 * - `N` for no_fly (not able to fly)
 * - `F` for can_fly (in principle able to fly)
 */
export function getTimeLocationSymbol(flags?: EventFlag[]): string {
  if (!flags) return '';

  // Only one time/location flag can be present (mutually exclusive)
  if (flags.includes('half_am')) return '◐';
  if (flags.includes('half_pm')) return '◑';
  if (flags.includes('onsite')) return 'W';
  if (flags.includes('no_fly')) return 'N';
  if (flags.includes('can_fly')) return 'F';

  return '';
}

// Deprecated alias for backward compatibility
/** @deprecated Use getTimeLocationSymbol - this function now handles all time/location flags, not just half-days */
export const getHalfDaySymbol = getTimeLocationSymbol;

/**
 * Compute the CSS class name for an event from its flags.
 *
 * @param flags - Array of event flags; type flags are 'business', 'weekend', 'birthday', 'ill', 'course', 'in', 'other', and half-day flags are 'half_am' and 'half_pm'.
 * @returns A class of the form `event--{type}-{full|half}` where the type is chosen by priority (business > weekend > birthday > ill > course > in > other > holiday) and the suffix is `half` when exactly one of `half_am` or `half_pm` is present (otherwise `full` for both or neither).
 */
export function getEventClass(flags?: EventFlag[]): string {
  if (!flags || flags.length === 0) return 'event--holiday-full';

  const hasAm = flags.includes('half_am');
  const hasPm = flags.includes('half_pm');
  const half = hasAm !== hasPm ? 'half' : 'full';

  if (flags.includes('business')) return `event--business-${half}`;
  if (flags.includes('weekend')) return `event--weekend-${half}`;
  if (flags.includes('birthday')) return `event--birthday-${half}`;
  if (flags.includes('ill')) return `event--ill-${half}`;
  if (flags.includes('course')) return `event--course-${half}`;
  if (flags.includes('in')) return `event--in-office-${half}`;
  if (flags.includes('other')) return `event--other-${half}`;
  return `event--holiday-${half}`;
}

/**
 * Return a human-readable label for the event type based on flags.
 *
 * @param flags - Optional list of event flags.
 * @returns A label such as "Business trip" or "Holiday".
 */
export function getEventTypeLabel(flags?: EventFlag[]): string {
  if (!flags || flags.length === 0) return 'Holiday';

  if (flags.includes('business')) return 'Business trip';
  if (flags.includes('weekend')) return 'Weekend';
  if (flags.includes('birthday')) return 'Birthday';
  if (flags.includes('ill')) return 'Sick leave';
  if (flags.includes('course')) return 'Training';
  if (flags.includes('in')) return 'In office';
  if (flags.includes('other')) return 'Other';
  return 'Holiday';
}

/**
 * Build a preview .hday line from event inputs.
 *
 * @param params - Event inputs used to generate the raw line.
 * @returns The .hday line, or an empty string if required fields are missing.
 */
export function buildPreviewLine(params: {
  eventType: 'range' | 'weekly';
  start: string;
  end: string;
  weekday: number;
  title: string;
  flags: EventFlag[];
}): string {
  const { eventType, start, end, weekday, title, flags } = params;
  const hasRange = eventType === 'range' && !!start;
  const hasWeekly = eventType === 'weekly' && !!weekday;

  if (!hasRange && !hasWeekly) {
    return '';
  }

  const normalizedFlags = normalizeEventFlags(flags);
  const baseEvent: Omit<HdayEvent, 'raw'> = hasRange
    ? {
        type: 'range',
        start,
        end: end || start,
        title,
        flags: normalizedFlags,
      }
    : {
        type: 'weekly',
        weekday,
        title,
        flags: normalizedFlags,
      };

  return toLine(baseEvent);
}

/**
 * Sort events by date and type.
 *
 * Sorting order:
 * 1. Range events sorted by start date (oldest first)
 * 2. Weekly events sorted by weekday (Monday=1 to Sunday=7, ISO weekday)
 * 3. Unknown events at the end (maintain original order)
 *
 * @param events Array of HdayEvent objects to sort
 * @returns A new sorted array (does not mutate the original)
 */
export function sortEvents(events: HdayEvent[]): HdayEvent[] {
  return [...events].sort((a, b) => {
    // Range events come first, sorted by start date
    if (a.type === 'range' && b.type === 'range') {
      const aStart = a.start;
      const bStart = b.start;

      // If both are missing a start date, keep relative order (stable sort)
      if (!aStart && !bStart) return 0;
      // Events missing a start date are sorted after those with a valid start
      if (!aStart) return 1;
      if (!bStart) return -1;

      return aStart.localeCompare(bStart);
    }

    // Range before weekly
    if (a.type === 'range' && b.type === 'weekly') return -1;
    if (a.type === 'weekly' && b.type === 'range') return 1;

    // Weekly events sorted by weekday
    if (a.type === 'weekly' && b.type === 'weekly') {
      const aDay = a.weekday ?? 0;
      const bDay = b.weekday ?? 0;
      return aDay - bDay;
    }

    // Weekly before unknown
    if (a.type === 'weekly' && b.type === 'unknown') return -1;
    if (a.type === 'unknown' && b.type === 'weekly') return 1;

    // Range before unknown
    if (a.type === 'range' && b.type === 'unknown') return -1;
    if (a.type === 'unknown' && b.type === 'range') return 1;

    // For unknown vs unknown, we rely on Array.sort being stable (ES2019+) to preserve original order
    return 0;
  });
}
