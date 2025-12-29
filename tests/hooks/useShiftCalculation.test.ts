import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import React from "react";
import { describe, expect, it } from "vitest";
import { SettingsProvider } from "../../src/contexts/SettingsContext";
import { useShiftCalculation } from "../../src/hooks/useShiftCalculation";
import { dayjs } from "../../src/utils/dateTimeUtils";

function wrapper({ children }: { children: ReactNode }) {
  return React.createElement(SettingsProvider, null, children);
}

describe("useShiftCalculation", () => {
  describe("Initialization", () => {
    it("initializes with default values", () => {
      const { result } = renderHook(() => useShiftCalculation(), {
        wrapper,
      });

      expect(result.current.myTeam).toBeNull();
      expect(dayjs.isDayjs(result.current.currentDate)).toBe(true);
      expect(result.current.currentShift).toBeNull();
    });

    it("initializes with a null team before settings are loaded", () => {
      const { result } = renderHook(() => useShiftCalculation(), {
        wrapper,
      });

      // Should start with default null value
      expect(result.current.myTeam).toBeNull();
    });
  });

  describe("Team Selection", () => {
    it("updates my team", () => {
      const { result } = renderHook(() => useShiftCalculation(), {
        wrapper,
      });

      act(() => {
        result.current.setMyTeam(3);
      });

      expect(result.current.myTeam).toBe(3);
    });

    it("clears my team", () => {
      const { result } = renderHook(() => useShiftCalculation(), {
        wrapper,
      });

      // First set a team
      act(() => {
        result.current.setMyTeam(3);
      });
      expect(result.current.myTeam).toBe(3);

      // Then clear it
      act(() => {
        result.current.setMyTeam(null);
      });

      expect(result.current.myTeam).toBeNull();
    });
  });

  describe("Date Management", () => {
    it("updates current date", () => {
      const { result } = renderHook(() => useShiftCalculation(), {
        wrapper,
      });
      const newDate = dayjs("2025-01-15");

      act(() => {
        result.current.setCurrentDate(newDate);
      });

      expect(result.current.currentDate.isSame(newDate, "day")).toBe(true);
    });
  });

  describe("Shift Data Integration", () => {
    it("calculates current shift for my team", () => {
      const { result } = renderHook(() => useShiftCalculation(), {
        wrapper,
      });

      act(() => {
        result.current.setMyTeam(1);
      });

      expect(result.current.currentShift).not.toBeNull();
      expect(result.current.currentShift?.teamNumber).toBe(1);
    });

    it("calculates today shifts for all teams", () => {
      const { result } = renderHook(() => useShiftCalculation(), {
        wrapper,
      });

      expect(result.current.todayShifts).toHaveLength(5); // CONFIG.TEAMS_COUNT
      expect(
        result.current.todayShifts.every((shift) => shift.teamNumber >= 1 && shift.teamNumber <= 5),
      ).toBe(true);
    });

    it("calculates next shift for my team", () => {
      const { result } = renderHook(() => useShiftCalculation(), {
        wrapper,
      });

      act(() => {
        result.current.setMyTeam(1);
      });

      expect(result.current.nextShift).not.toBeNull();
      expect(result.current.nextShift?.shift).toBeDefined();
    });

    it("returns null for current shift when no team selected", () => {
      const { result } = renderHook(() => useShiftCalculation(), {
        wrapper,
      });

      expect(result.current.currentShift).toBeNull();
      expect(result.current.nextShift).toBeNull();
    });

    it("provides current shift day", () => {
      const { result } = renderHook(() => useShiftCalculation(), {
        wrapper,
      });

      expect(dayjs.isDayjs(result.current.currentShiftDay)).toBe(true);
    });
  });
});
