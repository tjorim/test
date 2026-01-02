import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { TimeOffView } from "../../src/components/TimeOffView";
import { EventStoreProvider } from "../../src/contexts/EventStoreContext";
import { ToastProvider } from "../../src/contexts/ToastContext";

// Wrapper with all necessary providers
const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <EventStoreProvider>{children}</EventStoreProvider>
  </ToastProvider>
);

describe("TimeOffView", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Empty State", () => {
    it("should render empty state when no events", () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      expect(screen.getByText(/No time-off events yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Click "Add Event"/i)).toBeInTheDocument();
    });

    it("should show Add Event button in header", () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const addButton = screen.getByRole("button", { name: /Add Event/i });
      expect(addButton).toBeInTheDocument();
    });

    it("should show Import and Export buttons", () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      expect(screen.getByRole("button", { name: /Import/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Export/i })).toBeInTheDocument();
    });
  });

  describe("Event List", () => {
    it("should render events in a table", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      // Open add modal
      await user.click(screen.getByRole("button", { name: /Add Event/i }));

      // Fill in event details
      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");

      const titleInput = screen.getByLabelText(/Comment/i);
      await user.type(titleInput, "Test vacation");

      // Submit
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Check event appears in table
      expect(screen.getByText("Test vacation")).toBeInTheDocument();
      expect(screen.getByText("2025/01/15")).toBeInTheDocument();
    });

    it("should display event type badge", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      // Add a business trip event
      await user.click(screen.getByRole("button", { name: /Add Event/i }));

      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");

      // Select business trip type
      await user.click(screen.getByLabelText(/Business trip/i));

      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Check badge shows business type - use getAllByText since it appears in both badge and flags column
      const matches = screen.getAllByText(/business/i);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeInTheDocument();
    });
  });

  describe("Add Event Modal", () => {
    it("should open modal when Add Event button is clicked", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /Add Event/i }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/New event/i)).toBeInTheDocument();
    });

    it("should close modal when cancelled", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /Add Event/i }));

      const modal = screen.getByRole("dialog");
      const closeButton = within(modal).getByLabelText(/Close/i);
      await user.click(closeButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should validate required start date", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /Add Event/i }));

      // Try to submit without start date
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Should show validation error
      expect(screen.getByText(/Start date is required/i)).toBeInTheDocument();
    });

    it("should show live preview of .hday line", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /Add Event/i }));

      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");

      const titleInput = screen.getByLabelText(/Comment/i);
      await user.type(titleInput, "Preview test");

      // Check preview section - use getAllByText since date might appear multiple times
      expect(screen.getByText(/Raw line/i)).toBeInTheDocument();
      const dateMatches = screen.getAllByText(/2025\/01\/15/i);
      expect(dateMatches.length).toBeGreaterThan(0);
    });
  });

  describe("Edit Event", () => {
    it("should open edit modal with pre-filled data", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      // Add event first
      await user.click(screen.getByRole("button", { name: /Add Event/i }));
      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");
      const titleInput = screen.getByLabelText(/Comment/i);
      await user.type(titleInput, "Original title");
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Click edit button - find by icon class
      const editButtons = screen.getAllByRole("button");
      const editButton = editButtons.find((btn) => btn.querySelector(".bi-pencil"));
      if (editButton) {
        await user.click(editButton);
      }

      // Modal should show "Edit event" and have the original data - use getAllByText since title might appear in table too
      const editTexts = screen.getAllByText(/Edit event/i);
      expect(editTexts.length).toBeGreaterThan(0);
      const titleInputs = screen.getAllByDisplayValue(/Original title/i);
      expect(titleInputs.length).toBeGreaterThan(0);
    });
  });

  describe("Delete Event", () => {
    it("should show confirmation dialog before deleting", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      // Add event
      await user.click(screen.getByRole("button", { name: /Add Event/i }));
      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      const deleteButton = screen.getByRole("button", { name: /Delete Holiday/i });
      await user.click(deleteButton);

      // Confirmation dialog should appear
      const dialog = await screen.findByRole("dialog");
      expect(within(dialog).getByText(/Delete Event/i)).toBeInTheDocument();
      expect(within(dialog).getByText(/Are you sure/i)).toBeInTheDocument();
    });

    it("should delete event when confirmed", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      // Add event
      await user.click(screen.getByRole("button", { name: /Add Event/i }));
      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");
      const titleInput = screen.getByLabelText(/Comment/i);
      await user.type(titleInput, "To be deleted");
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      expect(screen.getByText("To be deleted")).toBeInTheDocument();

      const deleteButton = screen.getByRole("button", { name: /Delete To be deleted/i });
      await user.click(deleteButton);

      // Confirm deletion - scope to modal to avoid matching table delete buttons
      const modal = await screen.findByRole("dialog");
      const confirmButton = within(modal).getByRole("button", { name: /Delete/i });
      await user.click(confirmButton);

      // Event should be removed
      expect(screen.queryByText("To be deleted")).not.toBeInTheDocument();
      expect(screen.getByText(/No time-off events yet/i)).toBeInTheDocument();
    });
  });

  describe("Duplicate Event", () => {
    it("should open modal with pre-filled data when duplicate button is clicked", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      // Add an event first
      await user.click(screen.getByRole("button", { name: /Add Event/i }));
      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");
      const titleInput = screen.getByLabelText(/Comment/i);
      await user.type(titleInput, "Original event");
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Find and click duplicate button
      const duplicateButton = screen.getByRole("button", { name: /Duplicate Original event/i });
      await user.click(duplicateButton);

      // Modal should open with "New event" title (editIndex = -1)
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/New event/i)).toBeInTheDocument();

      // Modal should have pre-filled data from the original event
      const modalStartInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      expect(modalStartInput).toHaveValue("2025-01-15");

      const modalTitleInput = screen.getByLabelText(/Comment/i);
      expect(modalTitleInput).toHaveValue("Original event");
    });

    it("should create a new event when duplicate is submitted", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      // Add an event
      await user.click(screen.getByRole("button", { name: /Add Event/i }));
      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");
      const titleInput = screen.getByLabelText(/Comment/i);
      await user.type(titleInput, "Event to duplicate");
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Verify only one event exists
      const originalEvents = screen.getAllByText("Event to duplicate");
      expect(originalEvents).toHaveLength(1);

      // Click duplicate button
      const duplicateButton = screen.getByRole("button", { name: /Duplicate Event to duplicate/i });
      await user.click(duplicateButton);

      // Modify the duplicated event's title
      const modalTitleInput = screen.getByLabelText(/Comment/i);
      await user.clear(modalTitleInput);
      await user.type(modalTitleInput, "Duplicated event");

      // Submit the duplicate
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Both events should now exist in the table
      expect(screen.getByText("Event to duplicate")).toBeInTheDocument();
      expect(screen.getByText("Duplicated event")).toBeInTheDocument();
    });

    it("should allow duplicating and modifying event dates", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      // Add a business trip event
      await user.click(screen.getByRole("button", { name: /Add Event/i }));
      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");
      const endInput = screen.getByLabelText(/End \(YYYY\/MM\/DD\)/i);
      await user.type(endInput, "2025-01-17");
      await user.click(screen.getByLabelText(/Business trip/i));
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Duplicate the event
      const duplicateButton = screen.getByRole("button", { name: /Duplicate Business trip/i });
      await user.click(duplicateButton);

      // Modal should have the original dates and business flag
      const modalStartInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      expect(modalStartInput).toHaveValue("2025-01-15");
      const modalEndInput = screen.getByLabelText(/End \(YYYY\/MM\/DD\)/i);
      expect(modalEndInput).toHaveValue("2025-01-17");
      const businessRadio = screen.getByRole("radio", { name: /Business trip/i }) as HTMLInputElement;
      expect(businessRadio).toBeChecked();

      // Change the dates for the duplicate
      await user.clear(modalStartInput);
      await user.type(modalStartInput, "2025-02-15");
      await user.clear(modalEndInput);
      await user.type(modalEndInput, "2025-02-17");

      // Submit
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Both date ranges should exist
      expect(screen.getByText("2025/01/15 → 2025/01/17")).toBeInTheDocument();
      expect(screen.getByText("2025/02/15 → 2025/02/17")).toBeInTheDocument();
    });

    it("should allow duplicating weekly events", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      // Add a weekly event
      await user.click(screen.getByRole("button", { name: /Add Event/i }));
      const eventTypeSelect = screen.getByLabelText(/Event type/i);
      await user.selectOptions(eventTypeSelect, "weekly");
      const weekdaySelect = screen.getByLabelText(/Weekday/i);
      await user.selectOptions(weekdaySelect, "1");
      const titleInput = screen.getByLabelText(/Comment/i);
      await user.type(titleInput, "Weekly in office");
      await user.click(screen.getByLabelText(/In office/i));
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Duplicate the weekly event
      const duplicateButton = screen.getByRole("button", { name: /Duplicate Weekly in office/i });
      await user.click(duplicateButton);

      // Modal should be in weekly mode with correct weekday
      const modalEventTypeSelect = screen.getByLabelText(/Event type/i) as HTMLSelectElement;
      expect(modalEventTypeSelect.value).toBe("weekly");
      const modalWeekdaySelect = screen.getByLabelText(/Weekday/i) as HTMLSelectElement;
      expect(modalWeekdaySelect.value).toBe("1");
      const inOfficeRadio = screen.getByRole("radio", { name: /In office/i }) as HTMLInputElement;
      expect(inOfficeRadio).toBeChecked();

      // Change to a different weekday
      await user.selectOptions(modalWeekdaySelect, "5");
      const modalTitleInput = screen.getByLabelText(/Comment/i);
      await user.clear(modalTitleInput);
      await user.type(modalTitleInput, "Weekly in office - Friday");

      // Submit
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Both weekly events should exist
      expect(screen.getByText("Weekly in office")).toBeInTheDocument();
      expect(screen.getByText("Weekly in office - Friday")).toBeInTheDocument();
    });
  });

  describe("Weekly Events", () => {
    it("should allow creating weekly events", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /Add Event/i }));

      // Select weekly event type
      const eventTypeSelect = screen.getByLabelText(/Event type/i);
      await user.selectOptions(eventTypeSelect, "weekly");

      // Select weekday (e.g., Monday)
      const weekdaySelect = screen.getByLabelText(/Weekday/i);
      await user.selectOptions(weekdaySelect, "1");

      const titleInput = screen.getByLabelText(/Comment/i);
      await user.type(titleInput, "Every Monday");

      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Check event appears in table - use getAllByText since title might appear in multiple places
      const matches = screen.getAllByText(/Every Monday/i);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeInTheDocument();
    });
  });

  describe("Export", () => {
    it("should show error when exporting with no events", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /Export/i }));

      // Verify error toast appears
      expect(screen.getByText("No events to export")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on buttons", () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      expect(screen.getByRole("button", { name: /Add Event/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Import/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Export/i })).toBeInTheDocument();
    });

    it("should have proper table structure", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      // Add an event to display table
      await user.click(screen.getByRole("button", { name: /Add Event/i }));
      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      // Table should have proper column headers
      expect(screen.getByRole("columnheader", { name: /Type/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /Date \/ Pattern/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /Title/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /Flags/i })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: /Actions/i })).toBeInTheDocument();
    });
  });

  describe("Bulk Actions", () => {
    it("should toggle bulk selection using the header checkbox", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /Add Event/i }));
      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      const headerCheckbox = screen.getByRole("checkbox", { name: /Select all events/i });
      const rowCheckbox = screen.getByRole("checkbox", { name: /Select Holiday/i });

      expect(headerCheckbox).not.toBeChecked();
      expect(rowCheckbox).not.toBeChecked();

      await user.click(headerCheckbox);

      expect(headerCheckbox).toBeChecked();
      expect(rowCheckbox).toBeChecked();

      await user.click(headerCheckbox);

      expect(headerCheckbox).not.toBeChecked();
      expect(rowCheckbox).not.toBeChecked();
    });

    it("should enable undo and redo buttons after adding and undoing", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      const undoButton = screen.getByRole("button", { name: /Undo last change/i });
      const redoButton = screen.getByRole("button", { name: /Redo last change/i });

      expect(undoButton).toBeDisabled();
      expect(redoButton).toBeDisabled();

      await user.click(screen.getByRole("button", { name: /Add Event/i }));
      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      expect(undoButton).toBeEnabled();
      expect(redoButton).toBeDisabled();

      await user.click(undoButton);

      expect(redoButton).toBeEnabled();
    });

    it("should bulk delete selected events after confirmation", async () => {
      render(
        <AllProviders>
          <TimeOffView />
        </AllProviders>,
      );

      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /Add Event/i }));
      const startInput = screen.getByLabelText(/Start \(YYYY\/MM\/DD\)/i);
      await user.clear(startInput);
      await user.type(startInput, "2025-01-15");
      await user.click(screen.getByRole("button", { name: /^Add$/i }));

      expect(screen.getByText("2025/01/15")).toBeInTheDocument();

      await user.click(screen.getByRole("checkbox", { name: /Select Holiday/i }));
      await user.click(screen.getByRole("button", { name: /Delete Selected/i }));

      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: /Delete/i }));

      expect(screen.getByText(/No time-off events yet/i)).toBeInTheDocument();
    });
  });
});
