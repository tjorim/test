import type { PublicHolidayInfo } from "../types/holidays";
import { dayjs, formatHdayDate } from "./dateTimeUtils";

const DEFAULT_COUNTRY_CODE = "NL";
const STORAGE_KEY_PREFIX = "worktime_public_holidays";
const CACHE_TTL_DAYS = 30;

type StoredHoliday = {
  date: string;
  name: string;
  localName: string;
};

type StoredPayload = {
  year: number;
  countryCode: string;
  fetchedAt: string;
  holidays: StoredHoliday[];
};

const toHolidayMap = (holidays: StoredHoliday[]) =>
  new Map<string, PublicHolidayInfo>(
    holidays.map((holiday) => [
      holiday.date.replace(/-/g, "/"),
      { name: holiday.name, localName: holiday.localName },
    ]),
  );

const isCacheValid = (payload: StoredPayload) => {
  return dayjs(payload.fetchedAt).isAfter(dayjs().subtract(CACHE_TTL_DAYS, "day"));
};

const getStorageKey = (year: number, countryCode: string) =>
  `${STORAGE_KEY_PREFIX}_${countryCode}_${year}`;

export const fetchPublicHolidays = async (
  year: number,
  countryCode: string = DEFAULT_COUNTRY_CODE,
): Promise<Map<string, PublicHolidayInfo>> => {
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = window.localStorage.getItem(getStorageKey(year, countryCode));
    if (stored) {
      try {
        const payload = JSON.parse(stored) as StoredPayload;
        if (payload.year === year && payload.countryCode === countryCode && isCacheValid(payload)) {
          return toHolidayMap(payload.holidays);
        }
      } catch {
        // Ignore cache parsing issues and refetch.
      }
    }
  }

  const response = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to load public holidays: ${response.status}`);
  }

  const holidays = (await response.json()) as StoredHoliday[];
  const formatted = holidays.map((holiday) => ({
    date: formatHdayDate(holiday.date),
    name: holiday.name,
    localName: holiday.localName,
  }));

  if (typeof window !== "undefined" && window.localStorage) {
    const payload: StoredPayload = {
      year,
      countryCode,
      fetchedAt: new Date().toISOString(),
      holidays: formatted.map((holiday) => ({
        date: holiday.date.replace(/\//g, "-"),
        name: holiday.name,
        localName: holiday.localName,
      })),
    };
    window.localStorage.setItem(getStorageKey(year, countryCode), JSON.stringify(payload));
  }

  return new Map<string, PublicHolidayInfo>(
    formatted.map((holiday) => [
      holiday.date,
      { name: holiday.name, localName: holiday.localName },
    ]),
  );
};
