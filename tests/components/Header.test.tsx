import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { Header } from '../../src/components/Header';
import { EventStoreProvider } from '../../src/contexts/EventStoreContext';
import { SettingsProvider } from '../../src/contexts/SettingsContext';
import { ToastProvider } from '../../src/contexts/ToastContext';

// Mock the hooks
vi.mock('../../src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(() => true),
}));

vi.mock('../../src/hooks/usePWAInstall', () => ({
  usePWAInstall: vi.fn(() => ({
    isInstallable: false,
    promptInstall: vi.fn(),
  })),
}));

vi.mock('../../src/hooks/useServiceWorkerStatus', () => ({
  useServiceWorkerStatus: vi.fn(() => 'active'),
  getServiceWorkerStatusText: vi.fn(() => 'Service Worker is active'),
}));

import { useOnlineStatus } from '../../src/hooks/useOnlineStatus';
import { usePWAInstall } from '../../src/hooks/usePWAInstall';
import {
  getServiceWorkerStatusText,
  useServiceWorkerStatus,
} from '../../src/hooks/useServiceWorkerStatus';

const mockUseOnlineStatus = vi.mocked(useOnlineStatus);
const mockUsePWAInstall = vi.mocked(usePWAInstall);
const mockUseServiceWorkerStatus = vi.mocked(useServiceWorkerStatus);
const mockGetServiceWorkerStatusText = vi.mocked(getServiceWorkerStatusText);

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SettingsProvider>
      <EventStoreProvider>
        <ToastProvider>{ui}</ToastProvider>
      </EventStoreProvider>
    </SettingsProvider>,
  );
}

beforeEach(() => {
  mockUseOnlineStatus.mockReturnValue(true);
  mockUsePWAInstall.mockReturnValue({
    isInstallable: false,
    promptInstall: vi.fn(),
  });
  mockUseServiceWorkerStatus.mockReturnValue({
    isRegistered: true,
    isInstalling: false,
    isWaiting: false,
    isActive: true,
  });
  mockGetServiceWorkerStatusText.mockReturnValue('Service Worker is active');
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Header', () => {
  describe('Basic rendering', () => {
    it('renders NextShift title', () => {
      renderWithProviders(<Header />);
      expect(screen.getByText('NextShift')).toBeInTheDocument();
    });

    it('renders About button', () => {
      renderWithProviders(<Header />);
      expect(screen.getByLabelText('About NextShift')).toBeInTheDocument();
    });
  });

  describe('Online status', () => {
    it('shows online badge when online', () => {
      mockUseOnlineStatus.mockReturnValue(true);
      renderWithProviders(<Header />);
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('shows offline badge when offline', () => {
      mockUseOnlineStatus.mockReturnValue(false);
      renderWithProviders(<Header />);
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  describe('PWA install', () => {
    it('shows install button when installable', () => {
      const mockPromptInstall = vi.fn();
      mockUsePWAInstall.mockReturnValue({
        isInstallable: true,
        promptInstall: mockPromptInstall,
      });

      renderWithProviders(<Header />);
      expect(screen.getByText('Install')).toBeInTheDocument();
    });

    it('does not show install button when not installable', () => {
      mockUsePWAInstall.mockReturnValue({
        isInstallable: false,
        promptInstall: vi.fn(),
      });

      renderWithProviders(<Header />);
      expect(screen.queryByText('Install')).not.toBeInTheDocument();
    });
  });

  describe('About modal', () => {
    it('calls onShowAbout callback when about button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnShowAbout = vi.fn();
      renderWithProviders(<Header onShowAbout={mockOnShowAbout} />);

      const aboutButton = screen.getByLabelText('About NextShift');
      await user.click(aboutButton);

      expect(mockOnShowAbout).toHaveBeenCalledTimes(1);
    });

    it('opens About modal when About button is clicked in full App', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      const aboutButton = screen.getByLabelText('About NextShift');
      await user.click(aboutButton);

      // Modal should be open
      expect(screen.getByText('About NextShift')).toBeInTheDocument();
    });

    it('opens About modal when accessed from Settings panel in full App', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Open Settings panel first
      const settingsButton = screen.getByLabelText('Settings');
      await user.click(settingsButton);

      // Click About & Help in settings panel
      const aboutHelpButton = screen.getByText('About & Help');
      await user.click(aboutHelpButton);

      // Modal should be open
      expect(screen.getByText('About NextShift')).toBeInTheDocument();
    });

    it('closes About modal when Close button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Open About modal
      const aboutButton = screen.getByLabelText('About NextShift');
      await user.click(aboutButton);

      // Modal should be open
      expect(screen.getByText('About NextShift')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      // Modal should be closed
      expect(screen.queryByText('About NextShift')).not.toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    beforeEach(() => {
      // Clear any existing theme attribute
      document.documentElement.removeAttribute('data-bs-theme');
    });

    afterEach(() => {
      // Clean up theme attribute after each test
      document.documentElement.removeAttribute('data-bs-theme');
    });

    it('applies dark theme to document.documentElement when theme is set to dark', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Open Settings panel
      const settingsButton = screen.getByLabelText('Settings');
      await user.click(settingsButton);

      // Find and click the dark theme button
      const darkThemeButton = screen.getByRole('button', {
        name: /Dark/i,
      });
      await user.click(darkThemeButton);

      // Check that the theme is applied to the document element
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    });

    it('applies light theme to document.documentElement when theme is set to light', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Open Settings panel
      const settingsButton = screen.getByLabelText('Settings');
      await user.click(settingsButton);

      // Find and click the light theme button
      const lightThemeButton = screen.getByRole('button', {
        name: /Light/i,
      });
      await user.click(lightThemeButton);

      // Check that the theme is applied to the document element
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    });

    it('resolves auto theme to system preference and applies to document.documentElement', async () => {
      const user = userEvent.setup();

      // Mock system preference to dark
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderWithProviders(<App />);

      // Open Settings panel
      const settingsButton = screen.getByLabelText('Settings');
      await user.click(settingsButton);

      // Find and click the auto theme button (should be default)
      const autoThemeButton = screen.getByRole('button', {
        name: /Auto/i,
      });
      await user.click(autoThemeButton);

      // Check that the resolved theme is applied to the document element
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    });

    it('updates theme when system preference changes in auto mode', async () => {
      const user = userEvent.setup();

      let mediaQueryChangeHandler: (event: { matches: boolean }) => void = () => {};

      // Mock system preference initially to light
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false, // Initially light
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn((...args) => {
            mediaQueryChangeHandler = args[1];
          }),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderWithProviders(<App />);

      // Open Settings panel and ensure auto theme is selected (default)
      const settingsButton = screen.getByLabelText('Settings');
      await user.click(settingsButton);

      const autoThemeButton = screen.getByRole('button', {
        name: /Auto/i,
      });
      await user.click(autoThemeButton);

      // Check initial theme (light)
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');

      // Simulate system preference change to dark
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      // Trigger the change handler
      mediaQueryChangeHandler({ matches: true });

      // Check that theme updated to dark
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    });
  });
});
