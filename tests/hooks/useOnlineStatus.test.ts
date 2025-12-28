import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOnlineStatus } from '../../src/hooks/useOnlineStatus';

// Mock navigator
const mockNavigator = {
  onLine: true,
};

Object.defineProperty(globalThis, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('useOnlineStatus', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    mockNavigator.onLine = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  describe('Initialization', () => {
    it('initializes with navigator.onLine value when online', () => {
      mockNavigator.onLine = true;

      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current).toBe(true);
    });

    it('initializes with navigator.onLine value when offline', () => {
      mockNavigator.onLine = false;

      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current).toBe(false);
    });

    it('defaults to true when navigator is undefined', () => {
      const originalNavigator = globalThis.navigator;
      // @ts-expect-error
      delete globalThis.navigator;

      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current).toBe(true);

      // Restore navigator
      globalThis.navigator = originalNavigator;
    });
  });

  describe('Event listeners', () => {
    it('registers online and offline event listeners', () => {
      renderHook(() => useOnlineStatus());

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('removes event listeners on unmount', () => {
      const { unmount } = renderHook(() => useOnlineStatus());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });

  describe('Status updates', () => {
    it('updates to online when online event fires', () => {
      const { result } = renderHook(() => useOnlineStatus());

      // Set initial state to offline
      act(() => {
        const offlineHandler = addEventListenerSpy.mock.calls.find(
          (call) => call[0] === 'offline',
        )?.[1] as EventListener;
        if (offlineHandler) {
          offlineHandler(new Event('offline'));
        }
      });

      expect(result.current).toBe(false);

      // Trigger online event
      act(() => {
        const onlineHandler = addEventListenerSpy.mock.calls.find(
          (call) => call[0] === 'online',
        )?.[1] as EventListener;
        if (onlineHandler) {
          onlineHandler(new Event('online'));
        }
      });

      expect(result.current).toBe(true);
    });

    it('updates to offline when offline event fires', () => {
      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current).toBe(true);

      // Trigger offline event
      act(() => {
        const offlineHandler = addEventListenerSpy.mock.calls.find(
          (call) => call[0] === 'offline',
        )?.[1] as EventListener;
        if (offlineHandler) {
          offlineHandler(new Event('offline'));
        }
      });

      expect(result.current).toBe(false);
    });
  });
});
