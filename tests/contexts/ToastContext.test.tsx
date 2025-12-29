import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "../../src/contexts/ToastContext";

// Test component that uses the toast hook
function TestComponent() {
  const { showSuccess, showError, showWarning, showInfo, addToast } = useToast();

  return (
    <div>
      <button type="button" onClick={() => showSuccess("Success message", "✅")}>
        Show Success
      </button>
      <button type="button" onClick={() => showError("Error message", "❌")}>
        Show Error
      </button>
      <button type="button" onClick={() => showWarning("Warning message", "⚠️")}>
        Show Warning
      </button>
      <button type="button" onClick={() => showInfo("Info message", "ℹ️")}>
        Show Info
      </button>
      <button
        type="button"
        onClick={() =>
          addToast({
            message: "Custom toast",
            variant: "success",
            icon: "🎉",
            autohide: false,
          })
        }
      >
        Custom Toast
      </button>
    </div>
  );
}

describe("ToastContext", () => {
  it("should render ToastProvider without crashing", () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>,
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should throw error when useToast is used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useToast must be used within a ToastProvider");

    consoleSpy.mockRestore();
  });

  it("should show success toast when showSuccess is called", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    const successButton = screen.getByText("Show Success");

    act(() => {
      successButton.click();
    });

    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByText("✅")).toBeInTheDocument();
  });

  it("should show error toast when showError is called", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    const errorButton = screen.getByText("Show Error");

    act(() => {
      errorButton.click();
    });

    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByText("❌")).toBeInTheDocument();
  });

  it("should show warning toast when showWarning is called", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    const warningButton = screen.getByText("Show Warning");

    act(() => {
      warningButton.click();
    });

    expect(screen.getByText("Warning message")).toBeInTheDocument();
    expect(screen.getByText("⚠️")).toBeInTheDocument();
  });

  it("should show info toast when showInfo is called", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    const infoButton = screen.getByText("Show Info");

    act(() => {
      infoButton.click();
    });

    expect(screen.getByText("Info message")).toBeInTheDocument();
    expect(screen.getByText("ℹ️")).toBeInTheDocument();
  });

  it("should show custom toast with addToast", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    const customButton = screen.getByText("Custom Toast");

    act(() => {
      customButton.click();
    });

    expect(screen.getByText("Custom toast")).toBeInTheDocument();
    expect(screen.getByText("🎉")).toBeInTheDocument();
  });

  it("should handle multiple toasts", async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    const successButton = screen.getByText("Show Success");
    const errorButton = screen.getByText("Show Error");

    act(() => {
      successButton.click();
      errorButton.click();
    });

    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("should render toast container with correct positioning", () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    const successButton = screen.getByText("Show Success");

    act(() => {
      successButton.click();
    });

    const toastContainer = document.querySelector(".toast-container");
    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer).toHaveClass("toast-container");
    expect(toastContainer).toHaveClass("top-0");
    expect(toastContainer).toHaveClass("end-0");
    expect(toastContainer).toHaveClass("p-3");
  });
});
