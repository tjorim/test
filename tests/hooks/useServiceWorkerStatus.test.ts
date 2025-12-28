import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getServiceWorkerStatusText,
  useServiceWorkerStatus,
} from '../../src/hooks/useServiceWorkerStatus';
import { CONFIG } from '../../src/utils/config';

// Mock navigator.serviceWorker
const mockServiceWorker = {
  getRegistration: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

describe('useServiceWorkerStatus', () => {
  beforeEach(() => {
    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle unsupported service worker', () => {
    // Mock unsupported service worker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useServiceWorkerStatus());

    expect(result.current.isRegistered).toBe(false);
    expect(result.current.error).toBe('Service Worker not supported');
  });

  it('should handle no registration', async () => {
    mockServiceWorker.getRegistration.mockResolvedValue(null);

    const { result } = renderHook(() => useServiceWorkerStatus());

    // Wait for async effect
    await act(async () => {
      await Promise.resolve(); // Wait for microtasks
    });

    expect(result.current.isRegistered).toBe(false);
  });

  it('should handle active service worker', async () => {
    const mockRegistration = {
      active: {
        state: 'activated',
        postMessage: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      waiting: null,
      installing: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    mockServiceWorker.getRegistration.mockResolvedValue(mockRegistration);

    const { result } = renderHook(() => useServiceWorkerStatus());

    // Wait for async effect
    await act(async () => {
      await Promise.resolve(); // Wait for microtasks
    });

    expect(result.current.isRegistered).toBe(true);
    expect(result.current.isActive).toBe(true);
    expect(result.current.isWaiting).toBe(false);
    expect(result.current.isInstalling).toBe(false);
  });
});

describe('getServiceWorkerStatusText', () => {
  it('should return error message when error exists', () => {
    const status = {
      isRegistered: false,
      isInstalling: false,
      isWaiting: false,
      isActive: false,
      error: 'Test error',
    };

    expect(getServiceWorkerStatusText(status)).toBe('Service Worker Error: Test error');
  });

  it('should return not registered message', () => {
    const status = {
      isRegistered: false,
      isInstalling: false,
      isWaiting: false,
      isActive: false,
    };

    expect(getServiceWorkerStatusText(status)).toBe('Service Worker: Not Registered');
  });

  it('should return installing message', () => {
    const status = {
      isRegistered: true,
      isInstalling: true,
      isWaiting: false,
      isActive: false,
    };

    expect(getServiceWorkerStatusText(status)).toBe('Service Worker: Installing...');
  });

  it('should return update available message', () => {
    const status = {
      isRegistered: true,
      isInstalling: false,
      isWaiting: true,
      isActive: false,
    };

    expect(getServiceWorkerStatusText(status)).toBe('Service Worker: Update Available');
  });

  it('should return active message with version', () => {
    const status = {
      isRegistered: true,
      isInstalling: false,
      isWaiting: false,
      isActive: true,
      version: CONFIG.VERSION,
    };

    expect(getServiceWorkerStatusText(status)).toBe(`Service Worker: Active (v${CONFIG.VERSION})`);
  });

  it('should return active message without version', () => {
    const status = {
      isRegistered: true,
      isInstalling: false,
      isWaiting: false,
      isActive: true,
    };

    expect(getServiceWorkerStatusText(status)).toBe('Service Worker: Active');
  });
});
