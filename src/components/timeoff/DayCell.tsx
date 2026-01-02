import type { KeyboardEvent } from "react";
import type { HdayEvent } from "../../lib/hday/types";
import type { PublicHolidayInfo } from "../../types/publicHolidays";
import type { SchoolHolidayInfo } from "../../types/schoolHolidays";
import type { PaydayInfo } from "../../types/paydays";
import { dayjs } from "../../utils/dateTimeUtils";
import { getEventColor, getEventTypeLabel, getTimeLocationSymbol } from "../../lib/hday/parser";

export type DayEvent = {
  event: HdayEvent;
  index: number;
};

interface DayCellProps {
  date: dayjs.Dayjs;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isFocused: boolean;
  publicHoliday?: PublicHolidayInfo;
  paydayInfo?: PaydayInfo;
  schoolHoliday?: SchoolHolidayInfo;
  events: DayEvent[];
  onAddEvent: (date: dayjs.Dayjs) => void;
  onEditEvent: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, date: dayjs.Dayjs) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
}

/**
 * Maximum number of events to display per day before showing overflow count.
 * Limit ensures calendar cells remain readable on all screen sizes.
 */
const MAX_EVENTS = 3;

/**
 * Accessible labels for time/location symbols displayed in events.
 * Maps each symbol to a human-readable description for screen readers.
 */
const SYMBOL_LABELS: Record<string, string> = {
  "◐": "Morning half-day event",
  "◑": "Afternoon half-day event",
  W: "Onsite support",
  N: "Not able to fly",
  F: "In principle able to fly",
};

/**
 * Determines which visual indicator icons to display for a day based on event flags.
 * Currently supports:
 * - 📘 Course/training indicator for events with "course" flag
 *
 * @param events - Array of DayEvent objects for the day
 * @returns Array of emoji strings to display as indicators
 */
const getIndicatorIcons = (events: DayEvent[]) => {
  const icons = new Set<string>();

  events.forEach(({ event }) => {
    const flags = event.flags ?? [];
    if (flags.includes("course")) {
      icons.add("📘");
    }
  });

  return Array.from(icons);
};

const getIndicatorDetails = (
  publicHoliday?: PublicHolidayInfo,
  paydayInfo?: PaydayInfo,
  schoolHoliday?: SchoolHolidayInfo,
) => {
  return [
    publicHoliday && {
      key: "public-holiday",
      emoji: "🎉",
      title: publicHoliday.localName,
      label: publicHoliday.name,
    },
    schoolHoliday && {
      key: "school-holiday",
      emoji: "🏫",
      title: schoolHoliday.localName,
      label: schoolHoliday.name,
    },
    paydayInfo && {
      key: "payday",
      emoji: "💶",
      title: paydayInfo.name,
      label: paydayInfo.name,
    },
  ].filter(Boolean) as Array<{
    key: string;
    emoji: string;
    title: string;
    label: string;
  }>;
};

/**
 * DayCell renders an individual day in the month calendar grid.
 * 
 * Features:
 * - Displays up to 3 event chips with color coding and labels
 * - Shows overflow count when more than 3 events exist
 * - Visual indicators for courses, public holidays, school holidays, and paydays
 * - Highlights for weekends, today, and holidays
 * - Click-to-add new event on the day, click-to-edit existing events
 * - Keyboard navigation support via arrow keys
 * 
 * Accessibility:
 * - ARIA labels with full date and holiday information
 * - Focus management for keyboard navigation
 * - Color indicators supplemented with emoji symbols
 * - Semantic button elements for all interactive areas
 * 
 * @param props - Component props
 * @param props.date - The date this cell represents
 * @param props.isCurrentMonth - Whether this day is in the currently displayed month
 * @param props.isToday - Whether this day is today
 * @param props.isWeekend - Whether this day is Saturday or Sunday
 * @param props.isFocused - Whether this cell currently has keyboard focus
 * @param props.publicHoliday - Public holiday info if this day is a holiday
 * @param props.paydayInfo - Payday info if this day is a payday
 * @param props.schoolHoliday - School holiday info if this day is a school holiday
 * @param props.events - Array of events occurring on this day
 * @param props.onAddEvent - Callback when user clicks to add event
 * @param props.onEditEvent - Callback when user clicks to edit an event
 * @param props.onKeyDown - Callback for keyboard navigation
 * @param props.buttonRef - Ref callback for focus management
 */
export function DayCell({
  date,
  isCurrentMonth,
  isToday,
  isWeekend,
  isFocused,
  publicHoliday,
  paydayInfo,
  schoolHoliday,
  events,
  onAddEvent,
  onEditEvent,
  onKeyDown,
  buttonRef,
}: DayCellProps) {
  const visibleEvents = events.slice(0, MAX_EVENTS);
  const hiddenCount = Math.max(events.length - visibleEvents.length, 0);
  const indicators = getIndicatorIcons(events);
  const holidayIndicators = getIndicatorDetails(publicHoliday, paydayInfo, schoolHoliday);
  const ariaLabelParts = [date.format("dddd, MMMM D, YYYY")];
  if (isToday) {
    ariaLabelParts.push("Today");
  }
  if (publicHoliday) {
    ariaLabelParts.push(publicHoliday.name);
  }
  if (schoolHoliday) {
    ariaLabelParts.push(`School Holiday: ${schoolHoliday.name}`);
  }
  if (paydayInfo) {
    ariaLabelParts.push(paydayInfo.name);
  }

  return (
    <div
      role="gridcell"
      className={[
        "month-calendar-day",
        !isCurrentMonth ? "is-other-month" : "",
        isToday ? "is-today" : "",
        isWeekend ? "is-weekend" : "",
        publicHoliday ? "is-public-holiday" : "",
        schoolHoliday ? "is-school-holiday" : "",
        paydayInfo ? "is-payday" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="month-calendar-day-button"
        onClick={() => onAddEvent(date)}
        onKeyDown={(event) => onKeyDown(event, date)}
        ref={buttonRef}
        tabIndex={isFocused ? 0 : -1}
        aria-label={ariaLabelParts.join(" - ")}
      >
        <span className="month-calendar-day-number">{date.date()}</span>
        <span className="month-calendar-day-indicators" aria-hidden="true">
          {indicators.map((indicator) => (
            <span key={indicator} className="month-calendar-day-indicator">
              {indicator}
            </span>
          ))}
          {holidayIndicators.map((indicator) => (
            <span
              key={indicator.key}
              className="month-calendar-day-indicator"
              title={indicator.title}
            >
              {indicator.emoji}
            </span>
          ))}
        </span>
      </button>
      <div className="month-calendar-events">
        {visibleEvents.map(({ event, index }) => {
          const color = getEventColor(event.flags);
          const label = event.title || getEventTypeLabel(event.flags);
          const symbol = getTimeLocationSymbol(event.flags);

          return (
            <button
              key={`${date.format("YYYY-MM-DD")}-event-${index}`}
              type="button"
              className="month-calendar-event"
              onClick={(eventClick) => {
                eventClick.stopPropagation();
                onEditEvent(index);
              }}
              aria-label={`Edit ${label}`}
            >
              <span className="month-calendar-event-color" style={{ backgroundColor: color }} />
              <span className="month-calendar-event-label">
                {symbol && (
                  <span
                    className="month-calendar-event-symbol"
                    role="img"
                    aria-label={SYMBOL_LABELS[symbol]}
                  >
                    {symbol}
                  </span>
                )}
                {label}
              </span>
            </button>
          );
        })}
        {hiddenCount > 0 && (
          <div className="month-calendar-event-overflow text-muted">+{hiddenCount} more</div>
        )}
        {events.length === 0 && <div className="month-calendar-event-empty text-muted">—</div>}
      </div>
    </div>
  );
}
