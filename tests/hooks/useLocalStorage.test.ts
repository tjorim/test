import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { clearNonNecessaryStorage, useLocalStorage } from '../../src/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  const setFunctionalConsent = () => {
    const consentData = {
      preferences: {
        necessary: true,
        functional: true,
        analytics: false,
      },
      consentGiven: true,
      consentDate: new Date().toISOString(),
    };
    window.localStorage.setItem('nextshift_cookie_consent', JSON.stringify(consentData));
  };

  it('allows necessary storage without consent', () => {
    const { result } = renderHook(() => useLocalStorage('test_necessary', 'default', 'necessary'));

    expect(result.current[0]).toBe('default');

    // Should allow storing
    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(window.localStorage.getItem('test_necessary')).toBe('"new value"');
  });

  it('blocks functional storage without consent', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test_functional', 'default', 'functional'),
    );

    expect(result.current[0]).toBe('default');

    // Should not store to localStorage without consent
    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value'); // State updated
    expect(window.localStorage.getItem('test_functional')).toBeNull(); // Not persisted
  });

  it('allows functional storage with consent', () => {
    setFunctionalConsent();

    const { result } = renderHook(() =>
      useLocalStorage('test_functional', 'default', 'functional'),
    );

    expect(result.current[0]).toBe('default');

    // Should allow storing with consent
    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(window.localStorage.getItem('test_functional')).toBe('"new value"');
  });

  it('loads existing data when consent is given', () => {
    // Set up existing data
    window.localStorage.setItem('test_existing', '"existing value"');
    setFunctionalConsent();

    const { result } = renderHook(() => useLocalStorage('test_existing', 'default', 'functional'));

    expect(result.current[0]).toBe('existing value');
  });

  it('ignores existing data when consent is not given', () => {
    // Set up existing data
    window.localStorage.setItem('test_existing', '"existing value"');
    // No consent given

    const { result } = renderHook(() => useLocalStorage('test_existing', 'default', 'functional'));

    expect(result.current[0]).toBe('default'); // Should use default, not existing
  });

  it('always allows consent storage itself', () => {
    const { result } = renderHook(() =>
      useLocalStorage('nextshift_cookie_consent', {}, 'functional'),
    );

    // Should allow storing even without consent
    act(() => {
      result.current[1]({ test: 'data' });
    });

    expect(window.localStorage.getItem('nextshift_cookie_consent')).toBe('{"test":"data"}');
  });

  it('supports functional updates', () => {
    setFunctionalConsent();

    const { result } = renderHook(() => useLocalStorage('test_functional_update', 0, 'functional'));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem('test_functional_update')).toBe('1');
  });

  it('handles malformed JSON gracefully', () => {
    // Set up malformed JSON in localStorage
    window.localStorage.setItem('test_malformed', 'invalid-json');
    setFunctionalConsent();

    const { result } = renderHook(() =>
      useLocalStorage('test_malformed', 'fallback', 'functional'),
    );

    // Should fallback to initial value when JSON is malformed
    expect(result.current[0]).toBe('fallback');
  });
});

describe('clearNonNecessaryStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('clears non-necessary storage but preserves necessary keys', () => {
    // Set up various storage keys
    window.localStorage.setItem('nextshift_cookie_consent', 'consent data');
    window.localStorage.setItem('nextshift_necessary_onboarding_state', 'onboarding data');
    window.localStorage.setItem('nextshift_user_preferences', 'preferences data');
    window.localStorage.setItem('nextshift_pwa_dismissed', 'pwa data');
    window.localStorage.setItem('other_app_data', 'other data');

    clearNonNecessaryStorage();

    // Necessary keys should be preserved
    expect(window.localStorage.getItem('nextshift_cookie_consent')).toBe('consent data');
    expect(window.localStorage.getItem('nextshift_necessary_onboarding_state')).toBe(
      'onboarding data',
    );

    // Non-necessary NextShift keys should be cleared
    expect(window.localStorage.getItem('nextshift_user_preferences')).toBeNull();
    expect(window.localStorage.getItem('nextshift_pwa_dismissed')).toBeNull();

    // Other app data should be preserved
    expect(window.localStorage.getItem('other_app_data')).toBe('other data');
  });

  it('handles localStorage errors gracefully', () => {
    // Mock localStorage to throw an error on both getItem and removeItem
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: {
        ...originalLocalStorage,
        getItem: () => {
          throw new Error('Storage getItem error');
        },
        removeItem: () => {
          throw new Error('Storage removeItem error');
        },
      },
      writable: true,
    });

    // Should not throw even when both operations fail
    expect(() => clearNonNecessaryStorage()).not.toThrow();

    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  it('handles removeItem errors gracefully during clearing', () => {
    // Set up some nextshift data
    window.localStorage.setItem('nextshift_user_preferences', '{"test":true}');
    window.localStorage.setItem('nextshift_pwa_dismissed', 'true');

    const originalLocalStorage = window.localStorage;

    // Mock localStorage to throw errors only on removeItem
    Object.defineProperty(window, 'localStorage', {
      value: {
        ...originalLocalStorage,
        removeItem: () => {
          throw new Error('Storage removeItem error');
        },
      },
      writable: true,
    });

    // Should not throw despite removeItem failing
    expect(() => clearNonNecessaryStorage()).not.toThrow();

    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });
});
