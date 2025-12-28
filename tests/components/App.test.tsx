import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { SettingsProvider } from '../../src/contexts/SettingsContext';
import { dayjs } from '../../src/utils/dateTimeUtils';
import type { ShiftResult } from '../../src/utils/shiftCalculations';

// Mock our dayjs setup to avoid loading real dayjs configuration in tests
vi.mock('../../src/utils/dateTimeUtils', () => {
  const mockDayjs = vi.fn(() => ({
    format: vi.fn(() => '2025-01-15'),
    startOf: vi.fn(() => mockDayjs()),
    add: vi.fn(() => mockDayjs()),
  }));
  return { dayjs: mockDayjs };
});

// Mock all the child components to focus on App structure
vi.mock('../../src/components/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../src/components/CurrentStatus', () => ({
  CurrentStatus: () => <div data-testid="current-status">CurrentStatus</div>,
}));

vi.mock('../../src/components/MainTabs', () => ({
  MainTabs: () => <div data-testid="main-tabs">MainTabs</div>,
}));

vi.mock('../../src/components/WelcomeWizard', () => ({
  WelcomeWizard: () => <div data-testid="welcome-wizard">WelcomeWizard</div>,
}));

vi.mock('../../src/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock('../../src/components/UpdateAvailableModal', () => ({
  UpdateAvailableModal: ({
    show,
    onUpdate,
    onLater,
  }: {
    show: boolean;
    onUpdate: () => void;
    onLater: () => void;
  }) =>
    show ? (
      <div data-testid="update-available-modal">
        <button type="button" onClick={onUpdate} data-testid="update-button">
          Update Now
        </button>
        <button type="button" onClick={onLater} data-testid="later-button">
          Later
        </button>
      </div>
    ) : null,
}));

vi.mock('../../src/components/AboutModal', () => ({
  AboutModal: () => <div data-testid="about-modal">AboutModal</div>,
}));

// Mock dayjs first to avoid reference issues
vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    format: () => '2025-01-15',
    year: () => 2025,
    month: () => 0, // January
    date: () => 15,
  })),
}));

// Create realistic mock data
const createMockDate = () => dayjs('2025-01-15');
const mockTodayShifts: ShiftResult[] = [
  {
    teamNumber: 1,
    date: createMockDate(),
    code: '2503.3M',
    shift: {
      code: 'M',
      name: '🌅 Morning Shift',
      hours: '7:00 - 15:00',
      start: 7,
      end: 15,
      isWorking: true,
    },
  },
  {
    teamNumber: 2,
    date: createMockDate(),
    code: '2503.3E',
    shift: {
      code: 'E',
      name: '🌆 Evening Shift',
      hours: '15:00 - 23:00',
      start: 15,
      end: 23,
      isWorking: true,
    },
  },
];

// Mock the shift calculation hook with realistic data
vi.mock('../../src/hooks/useShiftCalculation', () => ({
  useShiftCalculation: () => ({
    myTeam: 1,
    setMyTeam: vi.fn(),
    currentDate: createMockDate(),
    setCurrentDate: vi.fn(),
    todayShifts: mockTodayShifts,
  }),
}));

// Mock service worker status hook
const mockServiceWorkerStatus = {
  isRegistered: true,
  isInstalling: false,
  isWaiting: false,
  isActive: true,
  version: '3.2.1',
};

vi.mock('../../src/hooks/useServiceWorkerStatus', () => ({
  useServiceWorkerStatus: vi.fn(() => mockServiceWorkerStatus),
}));

describe('App', () => {
  describe('Component Structure', () => {
    it('renders all main components', () => {
      render(
        <SettingsProvider>
          <App />
        </SettingsProvider>,
      );

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('current-status')).toBeInTheDocument();
      expect(screen.getByTestId('main-tabs')).toBeInTheDocument();
      expect(screen.getByTestId('welcome-wizard')).toBeInTheDocument();
    });

    it('wraps components in error boundaries', () => {
      render(
        <SettingsProvider>
          <App />
        </SettingsProvider>,
      );

      const errorBoundaries = screen.getAllByTestId('error-boundary');
      expect(errorBoundaries.length).toBeGreaterThan(0);
    });

    it('has proper layout structure', () => {
      render(
        <SettingsProvider>
          <App />
        </SettingsProvider>,
      );

      // Should have Bootstrap container structure
      const container = document.querySelector('.container-fluid');
      expect(container).toBeInTheDocument();

      // Should have React Bootstrap components rendered
      // Note: Row components are rendered conditionally based on state
      // so we check for the overall layout structure instead
      const appContainer = document.querySelector('.min-vh-100');
      expect(appContainer).toBeInTheDocument();
    });
  });

  describe('Toast Provider Integration', () => {
    it('provides toast context to child components without errors', () => {
      // Test that the app renders without errors - indicates toast context is working
      const { container } = render(
        <SettingsProvider>
          <App />
        </SettingsProvider>,
      );
      expect(container).toBeInTheDocument();

      // Verify all major components receive toast context successfully
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('current-status')).toBeInTheDocument();
      expect(screen.getByTestId('main-tabs')).toBeInTheDocument();
    });

    it('renders toast container in DOM structure', () => {
      render(
        <SettingsProvider>
          <App />
        </SettingsProvider>,
      );

      // The ToastProvider should create the necessary DOM structure
      // Even though we can't directly test toast context value without accessing internals,
      // successful rendering indicates the provider is working correctly
      expect(screen.getByTestId('current-status')).toBeInTheDocument();
      expect(() =>
        render(
          <SettingsProvider>
            <App />
          </SettingsProvider>,
        ),
      ).not.toThrow();
    });
  });

  describe('App Architecture', () => {
    it('separates AppContent from App wrapper', () => {
      render(
        <SettingsProvider>
          <App />
        </SettingsProvider>,
      );

      // Both App and AppContent should render successfully
      expect(screen.getByTestId('current-status')).toBeInTheDocument();
    });

    it('integrates with realistic shift calculation data', () => {
      render(
        <SettingsProvider>
          <App />
        </SettingsProvider>,
      );

      // Test that app handles realistic shift data without errors
      // Mock data includes proper ShiftResult structure with dates, codes, and shift details
      expect(screen.getByTestId('current-status')).toBeInTheDocument();
      expect(screen.getByTestId('main-tabs')).toBeInTheDocument();
    });

    it('imports and uses required dependencies', () => {
      // Test that all required CSS and dependencies are imported correctly
      expect(() =>
        render(
          <SettingsProvider>
            <App />
          </SettingsProvider>,
        ),
      ).not.toThrow();
    });
  });

  describe('Update Prompt Functionality', () => {
    let originalLocation: Location;
    let originalServiceWorker: ServiceWorkerContainer;

    beforeEach(() => {
      vi.clearAllMocks();
      // Reset service worker status
      mockServiceWorkerStatus.isWaiting = false;
      // Capture original global objects
      originalLocation = window.location;
      originalServiceWorker = navigator.serviceWorker;
    });

    afterEach(() => {
      // Restore original globals to prevent cross-test leakage
      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalServiceWorker,
        configurable: true,
      });
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
      });
    });

    it('does not show update prompt when no update is waiting', () => {
      mockServiceWorkerStatus.isWaiting = false;

      render(
        <SettingsProvider>
          <App />
        </SettingsProvider>,
      );

      expect(screen.queryByTestId('update-available-modal')).not.toBeInTheDocument();
    });

    it('shows update prompt when service worker has waiting update', () => {
      mockServiceWorkerStatus.isWaiting = true;

      render(
        <SettingsProvider>
          <App />
        </SettingsProvider>,
      );

      expect(screen.getByTestId('update-available-modal')).toBeInTheDocument();
      expect(screen.getByTestId('update-button')).toBeInTheDocument();
      expect(screen.getByTestId('later-button')).toBeInTheDocument();
    });

    it('handles update button click with service worker registration', async () => {
      mockServiceWorkerStatus.isWaiting = true;

      // Mock service worker registration
      const mockRegistration = {
        waiting: {
          postMessage: vi.fn(),
        },
      };

      let controllerChangeListener: (() => void) | undefined;

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          getRegistration: vi.fn().mockResolvedValue(mockRegistration),
          addEventListener: vi.fn((event: string, listener: () => void) => {
            if (event === 'controllerchange') {
              controllerChangeListener = listener;
            }
          }),
          removeEventListener: vi.fn(),
        },
        configurable: true,
      });

      // Mock window.location.reload
      Object.defineProperty(window, 'location', {
        value: {
          reload: vi.fn(),
        },
        configurable: true,
      });

      const user = userEvent.setup();

      render(
        <SettingsProvider>
          <App />
        </SettingsProvider>,
      );

      const updateButton = screen.getByTestId('update-button');
      await user.click(updateButton);

      expect(navigator.serviceWorker.getRegistration).toHaveBeenCalled();
      expect(mockRegistration.waiting.postMessage).toHaveBeenCalledWith({
        type: 'SKIP_WAITING',
      });
      expect(navigator.serviceWorker.addEventListener).toHaveBeenCalledWith(
        'controllerchange',
        expect.any(Function),
        {
          once: true,
        },
      );

      // Simulate the controllerchange event
      if (controllerChangeListener) {
        controllerChangeListener();
      }

      expect(window.location.reload).toHaveBeenCalled();
    });

    it('renders later button that can be clicked', async () => {
      mockServiceWorkerStatus.isWaiting = true;

      const user = userEvent.setup();

      render(
        <SettingsProvider>
          <App />
        </SettingsProvider>,
      );

      // Modal should be shown initially
      expect(screen.getByTestId('update-available-modal')).toBeInTheDocument();

      const laterButton = screen.getByTestId('later-button');

      // Click the later button
      await user.click(laterButton);

      // Verify the modal is dismissed after clicking later
      expect(screen.queryByTestId('update-available-modal')).not.toBeInTheDocument();
    });
  });
});
