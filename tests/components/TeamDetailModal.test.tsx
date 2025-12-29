import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TeamDetailModal } from '../../src/components/TeamDetailModal';
import { SettingsProvider } from '../../src/contexts/SettingsContext';
import { ToastProvider } from '../../src/contexts/ToastContext';

function renderWithSettings(ui: React.ReactElement) {
  return render(
    <ToastProvider>
      <SettingsProvider>{ui}</SettingsProvider>
    </ToastProvider>,
  );
}

describe('TeamDetailModal', () => {
  it('disables View Transfers button and shows tooltip when viewing own team', async () => {
    // Set user state with the unified storage structure
    window.localStorage.setItem(
      'worktime_user_state',
      JSON.stringify({
        hasCompletedOnboarding: true,
        myTeam: 2,
        settings: {
          timeFormat: '24h',
          theme: 'auto',
          notifications: 'off',
        },
      }),
    );
    renderWithSettings(
      <TeamDetailModal show={true} onHide={() => {}} teamNumber={2} onViewTransfers={vi.fn()} />,
    );

    // Simulate user is on team 2 (default selectedTeam is null, so we need to set it)
    // For this test, we assume the context is set up so myTeam === teamNumber
    // The button should be disabled
    const button = screen.getByRole('button', { name: /view transfers/i });
    expect(button).toBeDisabled();

    // Tooltip should show correct message when hovered
    if (!button.parentElement) {
      throw new Error('Button has no parent element');
    }
    fireEvent.mouseOver(button.parentElement);
    const tooltip = await screen.findByText(/you are viewing your own team/i);
    expect(tooltip).toBeTruthy();
  });

  it('enables View Transfers button for other teams', () => {
    window.localStorage.setItem(
      'worktime_user_state',
      JSON.stringify({
        hasCompletedOnboarding: true,
        myTeam: 2,
        settings: {
          timeFormat: '24h',
          theme: 'auto',
          notifications: 'off',
        },
      }),
    );
    renderWithSettings(
      <TeamDetailModal show={true} onHide={() => {}} teamNumber={3} onViewTransfers={vi.fn()} />,
    );
    // The button should be enabled (unless there are no transfers, but we are not testing that here)
    const button = screen.getByRole('button', { name: /view transfers/i });
    expect(button).not.toBeDisabled();
  });
});
