import type { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { dayjs } from "../utils/dateTimeUtils";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
  formatted: string;
}

/**
 * Compute the remaining time until a target Dayjs date.
 *
 * @param targetDate - The date to count down to; pass `null` to indicate no target (treated as expired)
 * @returns A CountdownResult containing `days`, `hours`, `minutes`, `seconds`, `totalSeconds`, `formatted`, and `isExpired`. When `targetDate` is `null`, invalid, or in the past, `isExpired` is `true`, numeric fields are zero and `formatted` is an empty string.
 */
function calculateTimeLeft(targetDate: Dayjs | null): CountdownResult {
  if (!targetDate || !targetDate.isValid()) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalSeconds: 0,
      formatted: "",
    };
  }

  const now = dayjs();
  const diff = targetDate.diff(now, "second");

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalSeconds: 0,
      formatted: "",
    };
  }

  const days = Math.floor(diff / (24 * 60 * 60));
  const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);
  const seconds = diff % 60;

  let formatted = "";
  if (days > 0) {
    formatted = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    formatted = `${minutes}m ${seconds}s`;
  } else {
    formatted = `${seconds}s`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalSeconds: diff,
    formatted,
  };
}

/**
 * Provide a live-updating countdown to a specified target date.
 *
 * @param targetDate - The date and time to count down to, or `null` to indicate an expired countdown
 * @param updateInterval - Update frequency in milliseconds (default 1000)
 * @returns The current countdown state: `days`, `hours`, `minutes`, `seconds`, `isExpired`, `totalSeconds` and `formatted`
 */
export function useCountdown(
  targetDate: Dayjs | null,
  updateInterval: number = 1000,
): CountdownResult {
  const [timeLeft, setTimeLeft] = useState<CountdownResult>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    // Update immediately when targetDate changes
    setTimeLeft(calculateTimeLeft(targetDate));

    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft(targetDate));
    };

    const interval = setInterval(updateCountdown, updateInterval);

    return () => clearInterval(interval);
  }, [targetDate, updateInterval]);

  return timeLeft;
}