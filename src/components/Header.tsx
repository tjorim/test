import { useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { SettingsPanel } from './SettingsPanel';

interface HeaderProps {
  onShowAbout?: () => void;
  onToggleTerminal?: () => void;
}

/**
 * Displays the top navigation bar for the NextShift application.
 *
 * The header shows the app title, online/offline status, a PWA install button when available,
 * and action buttons for Terminal view and About modal.
 *
 * @param onShowAbout - Optional callback invoked when the About button is clicked
 * @param onToggleTerminal - Optional callback invoked when the Terminal button is clicked to toggle terminal view mode
 */
export function Header({ onShowAbout, onToggleTerminal }: HeaderProps = {}) {
  const isOnline = useOnlineStatus();
  const { isInstallable, promptInstall } = usePWAInstall();
  const [showSettings, setShowSettings] = useState(false);

  const handleShowAbout = () => {
    onShowAbout?.();
  };

  const handleToggleTerminal = () => {
    onToggleTerminal?.();
  };

  return (
    <>
      <header className="sticky-top bg-primary text-white py-2 mb-3 shadow-sm">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="bi bi-clock-history me-2 header-icon"></i>
              <h1 className="h4 mb-0 fw-bold">NextShift</h1>
            </div>
            <div className="d-flex align-items-center header-button-spacing">
              <Badge
                bg={isOnline ? 'success' : 'danger'}
                className={`connection-${isOnline ? 'online' : 'offline'}`}
              >
                <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-1`}></i>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              {isInstallable && (
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={promptInstall}
                  aria-label="Install NextShift App"
                  className="header-button"
                >
                  <i className="bi bi-download"></i>
                  <span className="d-none d-lg-inline ms-1">Install</span>
                </Button>
              )}
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleToggleTerminal}
                aria-label="Terminal View"
                className="header-button"
              >
                <i className="bi bi-terminal"></i>
                <span className="d-none d-lg-inline ms-1">Terminal</span>
              </Button>
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleShowAbout}
                aria-label="About NextShift"
                className="header-button"
              >
                <i className="bi bi-info-circle"></i>
                <span className="d-none d-lg-inline ms-1">About</span>
              </Button>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setShowSettings(true)}
                aria-label="Settings"
                className="header-button"
              >
                <i className="bi bi-gear"></i>
                <span className="d-none d-lg-inline ms-1">Settings</span>
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Settings Panel */}
      <SettingsPanel
        show={showSettings}
        onHide={() => setShowSettings(false)}
        onShowAbout={onShowAbout}
      />
    </>
  );
}
