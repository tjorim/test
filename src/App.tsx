import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { AboutModal } from './components/AboutModal';
import { CurrentStatus } from './components/CurrentStatus';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { MainTabs } from './components/MainTabs';
import TerminalView from './components/terminal/TerminalView';
import { UpdateAvailableModal } from './components/UpdateAvailableModal';
import { WelcomeWizard } from './components/WelcomeWizard';
import { EventStoreProvider } from './contexts/EventStoreContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { useServiceWorkerStatus } from './hooks/useServiceWorkerStatus';
import { useShiftCalculation } from './hooks/useShiftCalculation';
import { CONFIG } from './utils/config';
import { dayjs } from './utils/dateTimeUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';

// Service worker update timeout fallback in milliseconds
// 2000ms provides sufficient time for the controllerchange event to fire
// while preventing indefinite waiting if the event doesn't trigger
const SERVICE_WORKER_UPDATE_TIMEOUT = 2000;

/**
 * Update the current browser URL to add or remove the terminal view query parameter.
 *
 * Updates the URL path to include `?view=terminal` when `enabled` is true, or removes the
 * `view` query parameter when `enabled` is false. Uses the browser history API with the
 * specified method to avoid a full page reload.
 *
 * @param enabled - If `true`, set `view=terminal` in the URL; if `false`, ensure the `view`
 * parameter is removed.
 * @param method - History update method to use: `'push'` to create a new history entry,
 * `'replace'` to modify the current entry.
 */
function updateTerminalModeUrl(enabled: boolean, method: 'push' | 'replace' = 'push') {
  const newParams = new URLSearchParams();
  if (enabled) {
    newParams.set('view', 'terminal');
  }
  const newUrl = newParams.toString()
    ? `${window.location.pathname}?${newParams.toString()}`
    : window.location.pathname;

  if (method === 'push') {
    window.history.pushState({}, '', newUrl);
  } else {
    window.history.replaceState({}, '', newUrl);
  }
}

/**
 * Determine whether the current URL requests the terminal view.
 *
 * @returns `true` if the URL contains `view=terminal`, `false` otherwise.
 */
function isTerminalModeInUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'terminal';
}

/**
 * The main application component for team selection and shift management.
 *
 * Coordinates team selection, loading state, and tab navigation, and renders the primary UI for viewing and managing shift information.
 *
 * @returns The application's rendered user interface.
 */
function AppContent() {
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamModalMode, setTeamModalMode] = useState<'onboarding' | 'change-team'>('onboarding');
  const [activeTab, setActiveTab] = useState('today');
  const [showAbout, setShowAbout] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [terminalMode, setTerminalMode] = useState(false);
  const { showSuccess, showInfo } = useToast();
  const serviceWorkerStatus = useServiceWorkerStatus();
  const { myTeam, setMyTeam, hasCompletedOnboarding, completeOnboardingWithTeam, settings } =
    useSettings();
  const { currentDate, setCurrentDate, todayShifts } = useShiftCalculation();

  // Handle URL parameters for deep linking
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const teamParam = urlParams.get('team');
    const dateParam = urlParams.get('date');
    const viewParam = urlParams.get('view');

    // Check for terminal mode
    if (viewParam === 'terminal') {
      setTerminalMode(true);
    }

    // Set active tab from URL
    if (tabParam && ['today', 'schedule', 'transfer', 'timeoff'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    // Set team from URL (if valid and user has completed onboarding)
    if (teamParam && hasCompletedOnboarding) {
      const teamNumber = parseInt(teamParam, 10);
      if (teamNumber >= 1 && teamNumber <= CONFIG.TEAMS_COUNT) {
        setMyTeam(teamNumber);
      }
    }

    // Set date from URL
    if (dateParam && hasCompletedOnboarding) {
      const parsedDate = dayjs(dateParam);
      if (parsedDate.isValid()) {
        setCurrentDate(parsedDate);
      }
    }

    // Clear URL parameters after processing to keep URL clean
    // But preserve the view parameter for terminal mode
    if (urlParams.toString()) {
      updateTerminalModeUrl(viewParam === 'terminal', 'replace');
    }
  }, [hasCompletedOnboarding, setMyTeam, setCurrentDate]); // Run when onboarding completes

  // Sync terminal mode with browser back/forward navigation
  // This ensures the URL stays as the source of truth for terminal mode
  useEffect(() => {
    const handlePopState = () => {
      setTerminalMode(isTerminalModeInUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Show welcome wizard only on first visit (never completed onboarding)
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      setTeamModalMode('onboarding');
      setShowTeamModal(true);
    }
  }, [hasCompletedOnboarding]); // Only run on mount

  // Theme switching effect - following Bootstrap 5.3 best practices
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const applyTheme = () => {
      const resolvedTheme =
        settings.theme === 'auto'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : settings.theme;

      document.documentElement.setAttribute('data-bs-theme', resolvedTheme);
    };

    applyTheme();

    // Watch for system preference changes when in auto mode
    if (settings.theme === 'auto') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', applyTheme);
      return () => mql.removeEventListener('change', applyTheme);
    }
  }, [settings.theme]);

  // Show update prompt when service worker has a waiting update
  useEffect(() => {
    if (serviceWorkerStatus.isWaiting) {
      setShowUpdatePrompt(true);
    }
  }, [serviceWorkerStatus.isWaiting]);

  const handleUpdateApp = () => {
    // Send SKIP_WAITING message to service worker to activate update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then((registration) => {
          if (registration?.waiting) {
            // Show updating message
            showInfo('Updating app...', '🔄');

            // Fallback timeout in case controllerchange doesn't fire
            const fallbackTimeout = setTimeout(() => {
              window.location.reload();
            }, SERVICE_WORKER_UPDATE_TIMEOUT);

            // Listen for the new service worker to take control before reloading
            navigator.serviceWorker.addEventListener(
              'controllerchange',
              () => {
                clearTimeout(fallbackTimeout);
                window.location.reload();
              },
              { once: true },
            );

            // Send message to activate the waiting service worker
            registration.waiting.postMessage({
              type: 'SKIP_WAITING',
            });
          } else {
            // No waiting service worker, show info and close prompt
            showInfo('No update is currently available. Please try again later.', '⚠️');
            setShowUpdatePrompt(false);
          }
        })
        .catch((error) => {
          console.error('Error during service worker update:', error);
          showInfo('Failed to update the app. Please try again later.', '⚠️');
        });
    } else {
      showInfo('Service workers are not supported in this browser.', '⚠️');
    }
  };

  const handleUpdateLater = () => {
    setShowUpdatePrompt(false);
  };

  const handleTeamSelect = (team: number) => {
    // Use the atomic function to avoid race condition
    completeOnboardingWithTeam(team);
    setShowTeamModal(false);
    showSuccess(`Team ${team} selected! Your shifts are now personalized.`, '🎯');
  };

  const handleChangeTeam = () => {
    setTeamModalMode('change-team');
    setShowTeamModal(true);
  };

  const handleSkipTeamSelection = () => {
    // Complete onboarding without selecting a team
    completeOnboardingWithTeam(null);
    setShowTeamModal(false);
    showInfo('Browsing all teams. Select a team anytime for personalized features!', '👀');
  };

  const handleTeamModalHide = () => {
    // If user closes modal (Maybe Later), don't mark onboarding as completed
    // They should see the wizard again on next visit
    setShowTeamModal(false);
  };

  const handleShowWhoIsWorking = () => {
    // Switch to Today tab to show who's working
    setActiveTab('today');
    setCurrentDate(dayjs());
    showInfo("Switched to Today view to see who's working", '👥');
  };

  const handleToggleTerminal = () => {
    const newTerminalMode = !terminalMode;
    setTerminalMode(newTerminalMode);
    updateTerminalModeUrl(newTerminalMode);
  };

  // Render terminal view if in terminal mode
  if (terminalMode) {
    return (
      <ErrorBoundary>
        <TerminalView initialTeam={myTeam || 1} onExitTerminal={handleToggleTerminal} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-vh-100">
        <Container fluid>
          <Header onShowAbout={() => setShowAbout(true)} onToggleTerminal={handleToggleTerminal} />
          <ErrorBoundary>
            <CurrentStatus
              myTeam={myTeam}
              onChangeTeam={handleChangeTeam}
              onShowWhoIsWorking={handleShowWhoIsWorking}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <MainTabs
              myTeam={myTeam}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              todayShifts={todayShifts}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </ErrorBoundary>
          <WelcomeWizard
            show={showTeamModal}
            onTeamSelect={handleTeamSelect}
            onSkip={handleSkipTeamSelection}
            onHide={handleTeamModalHide}
            startStep={teamModalMode === 'onboarding' ? 'welcome' : 'team-selection'}
          />
          <AboutModal show={showAbout} onHide={() => setShowAbout(false)} />
          <UpdateAvailableModal
            show={showUpdatePrompt}
            onUpdate={handleUpdateApp}
            onLater={handleUpdateLater}
          />
        </Container>
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <SettingsProvider>
      <EventStoreProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </EventStoreProvider>
    </SettingsProvider>
  );
}

export default App;
