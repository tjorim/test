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
 * Calculates the remaining time until a specified target date.
 *
 * If the target date is null or has already passed, returns an expired countdown result with all values set to zero and an empty formatted string. Otherwise, returns the days, hours, minutes, seconds, total seconds remaining, expiration status, and a formatted string representing the largest nonzero time units.
 *
 * @param targetDate - The date to count down to, or null for an expired countdown
 * @returns An object containing the breakdown of time left, expiration status, total seconds remaining, and a formatted string
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
 * React hook that provides a live-updating countdown to a specified target date.
 *
 * Calculates the remaining time until the given `targetDate`, updating at the specified interval. Returns an object containing days, hours, minutes, seconds, expiration status, total seconds remaining, and a formatted string representation.
 *
 * @param targetDate - The date and time to count down to, or `null` for an expired countdown
 * @param updateInterval - How often to update the countdown in milliseconds (default is 1000)
 * @returns An object with the current countdown state, including time components and formatted string
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
