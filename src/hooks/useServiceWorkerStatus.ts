import { useEffect, useState } from 'react';

interface ServiceWorkerStatus {
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  isActive: boolean;
  version?: string;
  error?: string;
}

/**
 * Custom hook to monitor service worker status and communicate with it
 * @returns Current service worker status and version information
 */
export function useServiceWorkerStatus(): ServiceWorkerStatus {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isActive: false,
  });

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
      setStatus((prev) => ({
        ...prev,
        error: 'Service Worker not supported',
      }));
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;
    let installing: ServiceWorker | null = null;
    let waiting: ServiceWorker | null = null;
    let active: ServiceWorker | null = null;

    const updateStatus = () => {
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          if (!reg) {
            setStatus((prev) => ({ ...prev, isRegistered: false }));
            return;
          }

          const sw = reg.active || reg.waiting || reg.installing;

          setStatus((prev) => ({
            ...prev,
            isRegistered: true,
            isInstalling: !!reg.installing,
            isWaiting: !!reg.waiting,
            isActive: !!reg.active,
          }));

          // Try to get version from service worker
          if (sw && sw.state === 'activated') {
            // Send message to service worker to get version
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
              if (event.data?.type === 'VERSION_RESPONSE') {
                setStatus((prev) => ({
                  ...prev,
                  version: event.data.version,
                }));
              }
            };

            sw.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
          }
        })
        .catch((error) => {
          setStatus((prev) => ({ ...prev, error: error.message }));
        });
    };

    // Initial status check
    updateStatus();

    // Listen for service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', updateStatus);

    // Listen for registration updates
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        registration = reg;
        registration.addEventListener('updatefound', updateStatus);

        if (registration.installing) {
          installing = registration.installing;
          installing.addEventListener('statechange', updateStatus);
        }
        if (registration.waiting) {
          waiting = registration.waiting;
          waiting.addEventListener('statechange', updateStatus);
        }
        if (registration.active) {
          active = registration.active;
          active.addEventListener('statechange', updateStatus);
        }
      }
    });

    return () => {
      // Remove all event listeners to prevent memory leaks
      navigator.serviceWorker.removeEventListener('controllerchange', updateStatus);

      if (registration) {
        registration.removeEventListener('updatefound', updateStatus);
      }

      if (installing) {
        installing.removeEventListener('statechange', updateStatus);
      }

      if (waiting) {
        waiting.removeEventListener('statechange', updateStatus);
      }

      if (active) {
        active.removeEventListener('statechange', updateStatus);
      }
    };
  }, []);

  return status;
}

/**
 * Get a human-readable status string for the service worker
 * @param status ServiceWorkerStatus object
 * @returns Formatted status string
 */
export function getServiceWorkerStatusText(status: ServiceWorkerStatus): string {
  if (status.error) {
    return `Service Worker Error: ${status.error}`;
  }

  if (!status.isRegistered) {
    return 'Service Worker: Not Registered';
  }

  if (status.isInstalling) {
    return 'Service Worker: Installing...';
  }

  if (status.isWaiting) {
    return 'Service Worker: Update Available';
  }

  if (status.isActive) {
    const versionText = status.version ? ` (v${status.version})` : '';
    return `Service Worker: Active${versionText}`;
  }

  return 'Service Worker: Loading...';
}
