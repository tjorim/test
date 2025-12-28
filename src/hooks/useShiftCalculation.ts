import type { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { dayjs } from '../utils/dateTimeUtils';
import {
  calculateShift,
  getAllTeamsShifts,
  getCurrentShiftDay,
  getNextShift,
  getShiftCode,
  type NextShiftResult,
  type ShiftResult,
} from '../utils/shiftCalculations';

export interface UseShiftCalculationReturn {
  myTeam: number | null; // The user's team from onboarding
  setMyTeam: (team: number | null) => void;
  currentDate: Dayjs;
  setCurrentDate: (date: Dayjs) => void;
  currentShift: ShiftResult | null;
  nextShift: NextShiftResult | null;
  todayShifts: ShiftResult[];
  currentShiftDay: Dayjs;
}

/**
 * Custom hook for managing shift calculations and state
 * @returns Object containing shift state and calculation functions
 */
export function useShiftCalculation(): UseShiftCalculationReturn {
  // Use unified user state from SettingsContext
  const { myTeam, setMyTeam } = useSettings();

  // Current date for calculations
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());

  // Calculate current shift for user's team
  const currentShift = useMemo((): ShiftResult | null => {
    if (!myTeam) return null;

    const shiftDay = getCurrentShiftDay(currentDate);
    const shift = calculateShift(shiftDay, myTeam);

    return {
      date: shiftDay,
      shift,
      code: getShiftCode(shiftDay, myTeam),
      teamNumber: myTeam,
    };
  }, [myTeam, currentDate]);

  // Calculate next shift for user's team
  const nextShift = useMemo((): NextShiftResult | null => {
    if (!myTeam) return null;

    return getNextShift(currentDate, myTeam);
  }, [myTeam, currentDate]);

  // Get all teams' shifts for current date
  const todayShifts = useMemo((): ShiftResult[] => {
    return getAllTeamsShifts(currentDate);
  }, [currentDate]);

  // Calculate current shift day (handles pre-7AM night shift logic)
  const currentShiftDay = useMemo((): Dayjs => {
    return getCurrentShiftDay(currentDate);
  }, [currentDate]);

  return {
    myTeam,
    setMyTeam,
    currentDate,
    setCurrentDate,
    currentShift,
    nextShift,
    todayShifts,
    currentShiftDay,
  };
}
