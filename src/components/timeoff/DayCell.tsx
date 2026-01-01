import type { KeyboardEvent } from "react";
import type { HdayEvent } from "../../lib/hday/types";
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
    if (flags.includes("holiday")) {
      icons.add("🎉");
    }
    const title = event.title?.toLowerCase();
    if (title && (title.includes("payday") || title.includes("salary") || title.includes("pay day"))) {
      icons.add("💶");
    }
  });

  return Array.from(icons);
};

export function DayCell({
  date,
  isCurrentMonth,
  isToday,
  isWeekend,
  isFocused,
  events,
  onAddEvent,
  onEditEvent,
  onKeyDown,
  buttonRef,
}: DayCellProps) {
  const visibleEvents = events.slice(0, MAX_EVENTS);
  const hiddenCount = Math.max(events.length - visibleEvents.length, 0);
  const indicators = getIndicatorIcons(events);

  return (
    <div
      className={[
        "month-calendar-day",
        isCurrentMonth ? "is-current-month" : "is-other-month",
        isToday ? "is-today" : "",
        isWeekend ? "is-weekend" : "",
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
        aria-label={date.format("dddd, MMMM D, YYYY")}
      >
        <span className="month-calendar-day-number">{date.date()}</span>
        {indicators.length > 0 && (
          <span className="month-calendar-day-indicators" aria-hidden="true">
            {indicators.join(" ")}
          </span>
        )}
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
