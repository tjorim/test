/**
 * Event conversion utilities
 *
 * Converts between shift calculations, .hday events, and the unified CalendarEvent model.
 */

import { v4 as uuidv4 } from "uuid";
import type { ShiftResult } from "../../utils/shiftCalculations";
import { dayjs } from "../../utils/dateTimeUtils";
import type { HdayEvent } from "../hday/types";
import { getEventColor, getEventTypeLabel, getTimeLocationSymbol } from "../hday/parser";
import type { CalendarEvent, HolidayMetadata, ShiftMetadata } from "./types";

/**
 * Convert a ShiftResult to a CalendarEvent
 *
 * @param shift - The shift result from shift calculations
 * @returns CalendarEvent representing the shift
 */
export function shiftToCalendarEvent(shift: ShiftResult): CalendarEvent {
  const dateStr = shift.date.format("YYYY-MM-DD");

  const meta: ShiftMetadata = {
    type: "shift",
    team: shift.teamNumber,
    shiftCode: shift.shift.code as "M" | "E" | "N" | "X",
    startTime:
      shift.shift.start !== null ? `${String(shift.shift.start).padStart(2, "0")}:00` : undefined,
    endTime:
      shift.shift.end !== null ? `${String(shift.shift.end).padStart(2, "0")}:00` : undefined,
    className: shift.shift.className,
  };

  return {
    id: uuidv4(),
    type: "shift",
    start: dateStr,
    end: dateStr,
    label: `${shift.shift.name} (T${shift.teamNumber})`,
    meta,
  };
}

/**
 * Convert an HdayEvent to CalendarEvent(s)
 *
 * Range events produce 1 CalendarEvent.
 * Weekly events produce N CalendarEvents (one per occurrence within the date range).
 *
 * @param event - The .hday event to convert
 * @param startDate - Start of date range (for weekly event generation)
 * @param endDate - End of date range (for weekly event generation)
 * @param sourceIndex - Original index in the .hday events array (for CRUD operations)
 * @returns Array of CalendarEvent(s)
 */
export function hdayToCalendarEvents(
  event: HdayEvent,
  startDate: Date,
  endDate: Date,
  sourceIndex?: number,
): CalendarEvent[] {
  if (event.type === "range") {
    return [hdayRangeToCalendarEvent(event, sourceIndex)];
  }

  if (event.type === "weekly") {
    return hdayWeeklyToCalendarEvents(event, startDate, endDate, sourceIndex);
  }

  // Unknown events are not rendered as calendar events
  return [];
}

/**
 * Convert a range HdayEvent to a single CalendarEvent
 */
function hdayRangeToCalendarEvent(event: HdayEvent, sourceIndex?: number): CalendarEvent {
  if (!event.start || !event.end) {
    throw new Error("Range event missing start or end date");
  }

  // Convert YYYY/MM/DD to YYYY-MM-DD (ISO format)
  const start = event.start.replace(/\//g, "-");
  const end = event.end.replace(/\//g, "-");

  const flags = event.flags || [];
  const color = getEventColor(flags);
  const typeLabel = getEventTypeLabel(flags);
  const symbol = getTimeLocationSymbol(flags);

  const meta: HolidayMetadata = {
    type: "holiday",
    color,
    flags,
    typeLabel,
    symbol,
    sourceIndex,
  };

  return {
    id: uuidv4(),
    type: "holiday",
    start,
    end,
    label: event.title || typeLabel,
    meta,
  };
}

/**
 * Convert a weekly HdayEvent to multiple CalendarEvents (one per occurrence in range)
 */
function hdayWeeklyToCalendarEvents(
  event: HdayEvent,
  startDate: Date,
  endDate: Date,
  sourceIndex?: number,
): CalendarEvent[] {
  if (event.weekday === undefined) {
    throw new Error("Weekly event missing weekday");
  }

  const events: CalendarEvent[] = [];
  const flags = event.flags || [];
  const color = getEventColor(flags);
  const typeLabel = getEventTypeLabel(flags);
  const symbol = getTimeLocationSymbol(flags);

  // Generate occurrences for each matching weekday in the date range
  let current = dayjs(startDate);
  const end = dayjs(endDate);

  // Find first occurrence of the target weekday
  while (current.isoWeekday() !== event.weekday && current.isBefore(end, "day")) {
    current = current.add(1, "day");
  }

  // Generate events for all occurrences
  while (current.isBefore(end, "day") || current.isSame(end, "day")) {
    const dateStr = current.format("YYYY-MM-DD");

    const meta: HolidayMetadata = {
      type: "holiday",
      color,
      flags,
      typeLabel,
      symbol,
      sourceIndex,
    };

    events.push({
      id: uuidv4(),
      type: "holiday",
      start: dateStr,
      end: dateStr,
      label: event.title || typeLabel,
      meta,
    });

    current = current.add(7, "days"); // Next week
  }

  return events;
}

/**
 * Filter CalendarEvents to those within a date range (inclusive)
 *
 * @param events - Array of calendar events to filter
 * @param startDate - Start of date range (YYYY-MM-DD)
 * @param endDate - End of date range (YYYY-MM-DD)
 * @returns Filtered array of events
 */
export function filterEventsInRange(
  events: CalendarEvent[],
  startDate: string,
  endDate: string,
): CalendarEvent[] {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  return events.filter((event) => {
    const eventStart = dayjs(event.start);
    const eventEnd = dayjs(event.end);

    // Event overlaps with range if:
    // - Event starts before or on range end AND
    // - Event ends after or on range start
    return (
      (eventStart.isBefore(end, "day") || eventStart.isSame(end, "day")) &&
      (eventEnd.isAfter(start, "day") || eventEnd.isSame(start, "day"))
    );
  });
}
