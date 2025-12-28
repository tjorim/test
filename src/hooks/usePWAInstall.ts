import { useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * React hook that manages Progressive Web App (PWA) installation prompts.
 *
 * Detects when the app becomes installable, exposes a boolean indicating installability, and provides a function to trigger the install prompt and await the user's response.
 *
 * Uses consent-aware storage for remembering user dismissal preferences.
 *
 * @returns An object containing `isInstallable`, a boolean indicating if the app can be installed, and `promptInstall`, a function that prompts the user to install the app and returns a boolean indicating if the user accepted.
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);

  // Use consent-aware storage for dismissal preference
  const [hasUserDismissedAutoPrompt, setUserDismissedAutoPrompt] = useLocalStorage(
    'nextshift_pwa_dismissed',
    false,
    'functional',
  );

  useEffect(() => {
    // Early return if window or necessary methods are not available
    if (typeof window === 'undefined' || !window.addEventListener || !window.removeEventListener) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event | null) => {
      if (!e) return;

      // Save the event for manual triggering
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Only prevent auto-prompt if user previously dismissed it
      // Otherwise, let the browser show its smart auto-prompt
      if (hasUserDismissedAutoPrompt && e.preventDefault) {
        e.preventDefault();
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (window.removeEventListener) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, [hasUserDismissedAutoPrompt]);

  const promptInstall = async () => {
    if (!deferredPrompt || isPrompting) return false;

    const promptToUse = deferredPrompt;
    setIsPrompting(true);
    setDeferredPrompt(null); // Clear immediately to prevent concurrent access
    setIsInstallable(false);

    try {
      await promptToUse.prompt();
      const { outcome } = await promptToUse.userChoice;

      // If user dismisses our manual prompt, remember this for future auto-prompts
      if (outcome === 'dismissed') {
        setUserDismissedAutoPrompt(true);
      }

      return outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    } finally {
      setIsPrompting(false);
    }
  };

  return {
    isInstallable,
    promptInstall,
  };
}
