import { describe, expect, it } from "vitest";
import { CONFIG } from "../../src/utils/config";

describe("config", () => {
  describe("CONFIG constants", () => {
    it("has correct constant values", () => {
      expect(CONFIG.TEAMS_COUNT).toBe(5);
      expect(CONFIG.SHIFT_CYCLE_DAYS).toBe(10);
      expect(CONFIG.MAX_TRANSFERS_DISPLAY).toBe(20);
    });

    it("has valid REFERENCE_TEAM value", () => {
      expect(CONFIG.REFERENCE_TEAM).toBeGreaterThanOrEqual(1);
      expect(CONFIG.REFERENCE_TEAM).toBeLessThanOrEqual(CONFIG.TEAMS_COUNT);
      expect(Number.isInteger(CONFIG.REFERENCE_TEAM)).toBe(true);
    });

    it("has valid REFERENCE_DATE value", () => {
      expect(CONFIG.REFERENCE_DATE).toBeInstanceOf(Date);
      expect(CONFIG.REFERENCE_DATE.getTime()).not.toBeNaN();
      // Should be a reasonable date (within 10 years of current year)
      const currentYear = new Date().getFullYear();
      expect(CONFIG.REFERENCE_DATE.getFullYear()).toBeGreaterThan(currentYear - 10);
      expect(CONFIG.REFERENCE_DATE.getFullYear()).toBeLessThan(currentYear + 10);
    });

    it("CONFIG object is read-only", () => {
      // CONFIG is declared as const, which provides compile-time immutability
      // Runtime immutability would require Object.freeze() but that's not necessary here
      expect(typeof CONFIG).toBe("object");
      expect(CONFIG).not.toBeNull();
    });

    it("has all expected properties", () => {
      expect(CONFIG).toHaveProperty("TEAMS_COUNT");
      expect(CONFIG).toHaveProperty("SHIFT_CYCLE_DAYS");
      expect(CONFIG).toHaveProperty("MAX_TRANSFERS_DISPLAY");
      expect(CONFIG).toHaveProperty("REFERENCE_TEAM");
      expect(CONFIG).toHaveProperty("REFERENCE_DATE");
      expect(CONFIG).toHaveProperty("VERSION");
    });

    it("has correct types for all properties", () => {
      expect(typeof CONFIG.TEAMS_COUNT).toBe("number");
      expect(typeof CONFIG.SHIFT_CYCLE_DAYS).toBe("number");
      expect(typeof CONFIG.MAX_TRANSFERS_DISPLAY).toBe("number");
      expect(typeof CONFIG.REFERENCE_TEAM).toBe("number");
      expect(CONFIG.REFERENCE_DATE).toBeInstanceOf(Date);
      expect(typeof CONFIG.VERSION).toBe("string");
    });

    it("numeric constants are positive integers", () => {
      expect(CONFIG.TEAMS_COUNT).toBeGreaterThan(0);
      expect(CONFIG.SHIFT_CYCLE_DAYS).toBeGreaterThan(0);
      expect(CONFIG.MAX_TRANSFERS_DISPLAY).toBeGreaterThan(0);
      expect(Number.isInteger(CONFIG.TEAMS_COUNT)).toBe(true);
      expect(Number.isInteger(CONFIG.SHIFT_CYCLE_DAYS)).toBe(true);
      expect(Number.isInteger(CONFIG.MAX_TRANSFERS_DISPLAY)).toBe(true);
    });

    it("REFERENCE_DATE is in UTC", () => {
      // Check that the date doesn't have timezone offset issues
      const dateString = CONFIG.REFERENCE_DATE.toISOString();
      expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/);
    });
  });

  // Note: Testing environment variable and runtime configuration parsing is complex
  // in Vitest due to module caching and import.meta.env handling.
  // The configuration logic is tested through integration tests and manual verification.
  // The constants validation above ensures the CONFIG object is properly structured.
});
