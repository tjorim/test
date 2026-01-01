import type { HolidayInfo } from "../types/holidays";
import type { PaydayInfo } from "../types/payday";
import { dayjs, formatHdayDate, getISOWeekday, pad2 } from "./dateTimeUtils";

const PAYDAY_LABEL = "Payday";
const PAYDAY_DAY_OF_MONTH = 25;

const isBusinessDay = (date: dayjs.Dayjs, holidayMap: Map<string, HolidayInfo>) => {
  const isoWeekday = getISOWeekday(date);
  const isWeekend = isoWeekday === 6 || isoWeekday === 7;
  const isHoliday = holidayMap.has(formatHdayDate(date));
  return !isWeekend && !isHoliday;
};

const getPaydayForMonth = (
  year: number,
  month: number,
  holidayMap: Map<string, HolidayInfo>,
) => {
  const scheduledPayday = dayjs(`${year}-${pad2(month)}-${PAYDAY_DAY_OF_MONTH}`);
  const isWeekend = getISOWeekday(scheduledPayday) >= 6;
  const isDecemberChristmasHoliday =
    month === 12 &&
    scheduledPayday.date() === PAYDAY_DAY_OF_MONTH &&
    holidayMap.has(formatHdayDate(scheduledPayday)) &&
    !isWeekend;
  let payday = isDecemberChristmasHoliday ? dayjs(`${year}-12-23`) : scheduledPayday;
  while (!isBusinessDay(payday, holidayMap)) {
    payday = payday.subtract(1, "day");
  }
  return payday;
};

export const getMonthlyPaydayMap = (
  year: number,
  holidayMap: Map<string, HolidayInfo>,
  label: string = PAYDAY_LABEL,
): Map<string, PaydayInfo> => {
  const map = new Map<string, PaydayInfo>();
  for (let month = 1; month <= 12; month += 1) {
    const payday = getPaydayForMonth(year, month, holidayMap);
    map.set(formatHdayDate(payday), { name: label });
  }
  return map;
};
