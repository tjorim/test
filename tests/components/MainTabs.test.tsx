import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import { MainTabs } from "../../src/components/MainTabs";
import { EventStoreProvider } from "../../src/contexts/EventStoreContext";
import { SettingsProvider } from "../../src/contexts/SettingsContext";
import { ToastProvider } from "../../src/contexts/ToastContext";
import { dayjs } from "../../src/utils/dateTimeUtils";

// Mock the child components
vi.mock("../../src/components/TodayView", () => ({
  TodayView: ({ myTeam }: { myTeam: number | null }) => (
    <div data-testid="today-view">TodayView - Team {myTeam}</div>
  ),
}));

vi.mock("../../src/components/ScheduleView", () => ({
  ScheduleView: ({ myTeam }: { myTeam: number | null }) => (
    <div data-testid="schedule-view">ScheduleView - Team {myTeam}</div>
  ),
}));

vi.mock("../../src/components/TransferView", () => ({
  TransferView: ({ myTeam }: { myTeam: number | null }) => (
    <div data-testid="transfer-view">TransferView - Team {myTeam}</div>
  ),
}));

const defaultProps = {
  myTeam: 1,
  currentDate: dayjs("2025-01-15"),
  setCurrentDate: vi.fn(),
  todayShifts: [],
  activeTab: "today",
  onTabChange: vi.fn(),
};

function renderWithProviders(ui: React.ReactElement) {
  return render(wrapWithProviders(ui));
}

function wrapWithProviders(ui: React.ReactElement) {
  return (
    <ToastProvider>
      <SettingsProvider>
        <EventStoreProvider>{ui}</EventStoreProvider>
      </SettingsProvider>
    </ToastProvider>
  );
}

describe("MainTabs", () => {
  describe("Tab rendering", () => {
    it("renders all tab buttons", () => {
      renderWithProviders(<MainTabs {...defaultProps} />);

      expect(screen.getByRole("tab", { name: "Today" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Schedule" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Transfers" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Time Off" })).toBeInTheDocument();
    });

    it("shows Today tab content by default", () => {
      renderWithProviders(<MainTabs {...defaultProps} />);
      expect(screen.getByTestId("today-view")).toBeInTheDocument();
    });

    it("shows correct tab content based on activeTab prop", () => {
      renderWithProviders(<MainTabs {...defaultProps} activeTab="schedule" />);
      expect(screen.getByTestId("schedule-view")).toBeInTheDocument();
    });
  });

  describe("Tab navigation", () => {
    it("switches to Schedule tab when clicked", async () => {
      const user = userEvent.setup();
      const mockOnTabChange = vi.fn();

      renderWithProviders(<MainTabs {...defaultProps} onTabChange={mockOnTabChange} />);

      const scheduleTab = screen.getByRole("tab", { name: "Schedule" });
      await user.click(scheduleTab);

      expect(mockOnTabChange).toHaveBeenCalledWith("schedule");
    });

    it("switches to Transfers tab when clicked", async () => {
      const user = userEvent.setup();
      const mockOnTabChange = vi.fn();

      renderWithProviders(<MainTabs {...defaultProps} onTabChange={mockOnTabChange} />);

      const transfersTab = screen.getByRole("tab", { name: "Transfers" });
      await user.click(transfersTab);

      expect(mockOnTabChange).toHaveBeenCalledWith("transfer");
    });
  });

  describe("Props synchronization", () => {
    it("updates active tab when activeTab prop changes", () => {
      const { rerender } = renderWithProviders(<MainTabs {...defaultProps} activeTab="today" />);
      expect(screen.getByTestId("today-view")).toBeInTheDocument();

      rerender(wrapWithProviders(<MainTabs {...defaultProps} activeTab="transfer" />));
      expect(screen.getByTestId("transfer-view")).toBeInTheDocument();
    });
  });
});
