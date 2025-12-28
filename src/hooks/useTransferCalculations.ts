import type { Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { CONFIG } from '../utils/config';
import { dayjs } from '../utils/dateTimeUtils';
import { calculateShift, type ShiftType } from '../utils/shiftCalculations';

export type TransferType = 'handover' | 'takeover';

export interface TransferInfo {
  date: Dayjs;
  fromTeam: number;
  toTeam: number;
  fromShiftType: ShiftType;
  toShiftType: ShiftType;
  type: TransferType; // 'handover' = my team transfers to other team, 'takeover' = other team transfers to my team
}

interface UseTransferCalculationsProps {
  myTeam: number | null; // The user's team from onboarding
  limit?: number;
  customStartDate?: string;
  customEndDate?: string;
}

interface UseTransferCalculationsReturn {
  transfers: TransferInfo[];
  hasMoreTransfers: boolean;
  availableOtherTeams: number[]; // Teams available to compare with (excludes user's team)
  otherTeam: number; // Currently selected other team
  setOtherTeam: (team: number) => void;
}

/**
 * Helper function to check for transfer between two shifts
 */
function checkTransfer(
  currentShift: { code: ShiftType; name: string },
  nextShift: { code: ShiftType; name: string },
  fromShift: ShiftType,
  toShift: ShiftType,
  date: Dayjs,
  fromTeam: number,
  toTeam: number,
  type: TransferType,
): TransferInfo | null {
  if (currentShift.code === fromShift && nextShift.code === toShift) {
    return {
      date,
      fromTeam,
      toTeam,
      fromShiftType: currentShift.code,
      toShiftType: nextShift.code,
      type,
    };
  }
  return null;
}

/**
 * Custom hook for managing transfer calculations between the user's team and other teams.
 *
 * Calculates shift transfers between user's team and comparison team,
 * detecting handover/takeover patterns based on shift transitions.
 * Supports optional date range filtering.
 */
export function useTransferCalculations({
  myTeam,
  limit = 20,
  customStartDate,
  customEndDate,
}: UseTransferCalculationsProps): UseTransferCalculationsReturn {
  // Get available other teams (excludes user's team)
  const availableOtherTeams = useMemo(() => {
    const allTeams = Array.from({ length: CONFIG.TEAMS_COUNT }, (_, i) => i + 1);
    return allTeams.filter((team) => team !== myTeam);
  }, [myTeam]);

  // State for selected other team to compare with
  const [otherTeam, setOtherTeam] = useState<number>(availableOtherTeams[0] || 1);

  // Update other team when user's team changes and current other team is not available
  useEffect(() => {
    if (!availableOtherTeams.includes(otherTeam)) {
      setOtherTeam(availableOtherTeams[0] || 1);
    }
  }, [availableOtherTeams, otherTeam]);

  // Calculate transfers based on current parameters
  const transfersResult = useMemo(() => {
    if (!myTeam) return { transfers: [], hasMoreTransfers: false };

    const foundTransfers: TransferInfo[] = [];

    // Determine date range
    const startDate = customStartDate ? dayjs(customStartDate) : dayjs();
    const endDate = customEndDate ? dayjs(customEndDate) : null;

    // If we have a date range, scan within it; otherwise scan forward from today
    const maxDaysToScan = endDate ? endDate.diff(startDate, 'day') + 1 : 365; // Default to scanning 1 year forward

    // Add performance warning for large date ranges
    if (endDate && endDate.diff(startDate, 'day') > 365) {
      console.warn(
        'Large date range detected. Consider limiting the range for better performance.',
      );
    }

    const currentDate = startDate;

    for (let day = 0; day < maxDaysToScan && foundTransfers.length < limit; day++) {
      const scanDate = currentDate.add(day, 'day');
      const nextDate = scanDate.add(1, 'day');

      // If we have an end date, don't scan beyond it
      if (endDate && scanDate.isAfter(endDate)) {
        break;
      }

      const myTeamShift = calculateShift(scanDate, myTeam);
      const otherTeamShift = calculateShift(scanDate, otherTeam);
      const myTeamNextShift = calculateShift(nextDate, myTeam);
      const otherTeamNextShift = calculateShift(nextDate, otherTeam);

      // Check for transfer patterns
      const transfers = [
        // Handovers: My team transfers to other team (same day)
        checkTransfer(
          myTeamShift,
          otherTeamShift,
          'M',
          'E',
          scanDate,
          myTeam,
          otherTeam,
          'handover',
        ),
        checkTransfer(
          myTeamShift,
          otherTeamShift,
          'E',
          'N',
          scanDate,
          myTeam,
          otherTeam,
          'handover',
        ),

        // Handover: My team night shift to other team morning shift (next day)
        !endDate || !nextDate.isAfter(endDate)
          ? checkTransfer(
              myTeamShift,
              otherTeamNextShift,
              'N',
              'M',
              nextDate,
              myTeam,
              otherTeam,
              'handover',
            )
          : null,

        // Takeovers: Other team transfers to my team (same day)
        checkTransfer(
          otherTeamShift,
          myTeamShift,
          'M',
          'E',
          scanDate,
          otherTeam,
          myTeam,
          'takeover',
        ),
        checkTransfer(
          otherTeamShift,
          myTeamShift,
          'E',
          'N',
          scanDate,
          otherTeam,
          myTeam,
          'takeover',
        ),

        // Takeover: Other team night shift to my team morning shift (next day)
        !endDate || !nextDate.isAfter(endDate)
          ? checkTransfer(
              otherTeamShift,
              myTeamNextShift,
              'N',
              'M',
              nextDate,
              otherTeam,
              myTeam,
              'takeover',
            )
          : null,
      ];

      // Add valid transfers
      transfers.forEach((transfer) => {
        if (transfer) {
          foundTransfers.push(transfer);
        }
      });
    }

    // Sort transfers by date
    foundTransfers.sort((a, b) => a.date.valueOf() - b.date.valueOf());

    // Check if there are more transfers available
    const hasMoreTransfers =
      foundTransfers.length === limit &&
      (!endDate || currentDate.add(maxDaysToScan, 'day').isBefore(endDate));

    return {
      transfers: foundTransfers,
      hasMoreTransfers,
    };
  }, [myTeam, otherTeam, limit, customStartDate, customEndDate]);

  return {
    transfers: transfersResult.transfers,
    hasMoreTransfers: transfersResult.hasMoreTransfers,
    availableOtherTeams,
    otherTeam,
    setOtherTeam,
  };
}
