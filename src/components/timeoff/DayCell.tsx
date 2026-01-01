import type { KeyboardEvent } from "react";
import type { HdayEvent } from "../../lib/hday/types";
import type { PublicHolidayInfo } from "../../hooks/usePublicHolidays";
import type { SchoolHolidayInfo } from "../../hooks/useSchoolHolidays";
import type { PaydayInfo } from "../../utils/paydayUtils";
import { dayjs } from "../../utils/dateTimeUtils";
import { getEventColor, getEventTypeLabel, getTimeLocationSymbol } from "../../lib/hday/parser";

type DayEvent = {
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

const MAX_EVENTS = 3;

const getIndicatorIcons = (events: DayEvent[]) => {
  const icons = new Set<string>();

  events.forEach(({ event }) => {
    const flags = event.flags ?? [];
    if (flags.includes("course")) {
      icons.add("🏫");
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
      title: schoolHoliday.name,
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
      className={[
        "month-calendar-day",
        isCurrentMonth ? "is-current-month" : "is-other-month",
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
              key={`${index}-${label}`}
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
                {symbol && <span className="month-calendar-event-symbol">{symbol}</span>}
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
