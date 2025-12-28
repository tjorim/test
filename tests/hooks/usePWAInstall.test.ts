import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePWAInstall } from '../../src/hooks/usePWAInstall';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Mock the beforeinstallprompt event
const mockBeforeInstallPromptEvent = {
  preventDefault: vi.fn(),
  prompt: vi.fn().mockResolvedValue(undefined),
  userChoice: Promise.resolve({ outcome: 'accepted' as const }),
} as unknown as BeforeInstallPromptEvent;

describe('usePWAInstall', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.clearAllMocks();
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstallable).toBe(false);
    expect(typeof result.current.promptInstall).toBe('function');
  });

  it('registers event listeners on mount', () => {
    renderHook(() => usePWAInstall());

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function));
  });

  it('removes event listeners on unmount', () => {
    const { unmount } = renderHook(() => usePWAInstall());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function));
  });

  it('becomes installable when beforeinstallprompt event fires', () => {
    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstallable).toBe(false);

    // Simulate the beforeinstallprompt event
    act(() => {
      const beforeInstallPromptHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'beforeinstallprompt',
      )?.[1] as EventListener;

      if (beforeInstallPromptHandler) {
        beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
      }
    });

    expect(result.current.isInstallable).toBe(true);
  });

  it('handles promptInstall when installable', async () => {
    const { result } = renderHook(() => usePWAInstall());

    // First make it installable
    act(() => {
      const beforeInstallPromptHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'beforeinstallprompt',
      )?.[1] as EventListener;

      if (beforeInstallPromptHandler) {
        beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
      }
    });

    // Now test the prompt
    let promptResult: boolean | undefined;
    await act(async () => {
      promptResult = await result.current.promptInstall();
    });

    expect(mockBeforeInstallPromptEvent.prompt).toHaveBeenCalled();
    expect(promptResult).toBe(true);
  });

  it('returns false when promptInstall called but not installable', async () => {
    const { result } = renderHook(() => usePWAInstall());

    let promptResult: boolean | undefined;
    await act(async () => {
      promptResult = await result.current.promptInstall();
    });

    expect(promptResult).toBe(false);
    expect(mockBeforeInstallPromptEvent.prompt).not.toHaveBeenCalled();
  });

  it('handles appinstalled event', () => {
    const { result } = renderHook(() => usePWAInstall());

    // Make it installable first
    act(() => {
      const beforeInstallPromptHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'beforeinstallprompt',
      )?.[1] as EventListener;

      if (beforeInstallPromptHandler) {
        beforeInstallPromptHandler(mockBeforeInstallPromptEvent);
      }
    });

    expect(result.current.isInstallable).toBe(true);

    // Simulate app installed
    act(() => {
      const appInstalledHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'appinstalled',
      )?.[1] as EventListener;

      if (appInstalledHandler) {
        appInstalledHandler(new Event('appinstalled'));
      }
    });

    expect(result.current.isInstallable).toBe(false);
  });
});
