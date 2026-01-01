import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import { dayjs, getWeekdayName } from "../../utils/dateTimeUtils";
import type { HdayEvent } from "../../lib/hday/types";
import { DayCell } from "./DayCell";

type DayEvent = {
  event: HdayEvent;
  index: number;
};

interface MonthCalendarProps {
  events: HdayEvent[];
  month: dayjs.Dayjs;
  onMonthChange: (month: dayjs.Dayjs) => void;
  onAddEvent: (date: dayjs.Dayjs) => void;
  onEditEvent: (index: number) => void;
}

const DAY_FORMAT = "YYYY-MM-DD";

const parseHdayDate = (value?: string) => {
  if (!value) return null;
  return dayjs(value.replace(/\//g, "-"));
};

const buildCalendarDays = (month: dayjs.Dayjs) => {
  const start = month.startOf("month").startOf("week");
  const end = month.endOf("month").endOf("week");
  const days: dayjs.Dayjs[] = [];
  let current = start;
  while (current.isBefore(end) || current.isSame(end, "day")) {
    days.push(current);
    current = current.add(1, "day");
  }
  return days;
};

export function MonthCalendar({
  events,
  month,
  onMonthChange,
  onAddEvent,
  onEditEvent,
}: MonthCalendarProps) {
  const days = useMemo(() => buildCalendarDays(month), [month]);
  const today = dayjs();
  const [focusedDateKey, setFocusedDateKey] = useState<string>(() => {
    const todayKey = today.format(DAY_FORMAT);
    return days.some((day) => day.format(DAY_FORMAT) === todayKey)
      ? todayKey
      : month.startOf("month").format(DAY_FORMAT);
  });

  const dayRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  useEffect(() => {
    const monthKey = month.startOf("month").format(DAY_FORMAT);
    setFocusedDateKey((prev) => {
      const hasPrev = days.some((day) => day.format(DAY_FORMAT) === prev);
      if (hasPrev) {
        return prev;
      }
      return monthKey;
    });
  }, [days, month]);

  useEffect(() => {
    const ref = dayRefs.current.get(focusedDateKey);
    if (ref) {
      ref.focus();
    }
  }, [focusedDateKey]);

  const dayEvents = useMemo(() => {
    const map = new Map<string, DayEvent[]>();
    const dayKeys = new Set(days.map((day) => day.format(DAY_FORMAT)));

    const addEvent = (date: dayjs.Dayjs, entry: DayEvent) => {
      const key = date.format(DAY_FORMAT);
      if (!dayKeys.has(key)) return;
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    };

    events.forEach((event, index) => {
      if (event.type === "range") {
        const start = parseHdayDate(event.start);
        const end = parseHdayDate(event.end ?? event.start);
        if (!start || !end) return;
        let current = start;
        while (current.isBefore(end) || current.isSame(end, "day")) {
          addEvent(current, { event, index });
          current = current.add(1, "day");
        }
      } else if (event.type === "weekly" && event.weekday) {
        days.forEach((day) => {
          if (day.isoWeekday() === event.weekday) {
            addEvent(day, { event, index });
          }
        });
      }
    });

    return map;
  }, [days, events]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => getWeekdayName(index + 1)),
    [],
  );

  const handleMoveFocus = (nextDate: dayjs.Dayjs) => {
    const nextKey = nextDate.format(DAY_FORMAT);
    const nextMonth = nextDate.startOf("month");

    if (!nextMonth.isSame(month, "month")) {
      onMonthChange(nextMonth);
    }

    setFocusedDateKey(nextKey);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: dayjs.Dayjs) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        handleMoveFocus(date.subtract(1, "day"));
        break;
      case "ArrowRight":
        event.preventDefault();
        handleMoveFocus(date.add(1, "day"));
        break;
      case "ArrowUp":
        event.preventDefault();
        handleMoveFocus(date.subtract(7, "day"));
        break;
      case "ArrowDown":
        event.preventDefault();
        handleMoveFocus(date.add(7, "day"));
        break;
      case "Home":
        event.preventDefault();
        handleMoveFocus(month.startOf("month"));
        break;
      case "End":
        event.preventDefault();
        handleMoveFocus(month.endOf("month"));
        break;
      default:
        break;
    }
  };

  return (
    <div className="month-calendar">
      <div className="month-calendar-header d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onMonthChange(month.subtract(1, "month"))}
            aria-label="Previous month"
          >
            <i className="bi bi-chevron-left" aria-hidden="true"></i>
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onMonthChange(dayjs())}
            aria-label="Jump to current month"
          >
            Today
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onMonthChange(month.add(1, "month"))}
            aria-label="Next month"
          >
            <i className="bi bi-chevron-right" aria-hidden="true"></i>
          </Button>
        </div>
        <div className="month-calendar-title">
          <span>{month.format("MMMM YYYY")}</span>
        </div>
      </div>

      <div className="month-calendar-grid">
        {weekDays.map((label) => (
          <div key={label} className="month-calendar-weekday">
            {label}
          </div>
        ))}

        {days.map((day) => {
          const key = day.format(DAY_FORMAT);
          const cellEvents = dayEvents.get(key) ?? [];
          return (
            <DayCell
              key={key}
              date={day}
              isCurrentMonth={day.isSame(month, "month")}
              isToday={day.isSame(today, "day")}
              isWeekend={day.isoWeekday() >= 6}
              isFocused={focusedDateKey === key}
              events={cellEvents}
              onAddEvent={onAddEvent}
              onEditEvent={onEditEvent}
              onKeyDown={handleKeyDown}
              buttonRef={(node) => {
                dayRefs.current.set(key, node);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
