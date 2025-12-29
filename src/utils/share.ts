// src/utils/share.ts
// Generic and context-aware sharing utility for Worktime

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * Attempts to share using the Web Share API, falling back to clipboard.
 * @param options ShareOptions (title, text, url)
 * @param onSuccess Optional callback for success
 * @param onError Optional callback for error
 */
export async function share(
  options: ShareOptions,
  onSuccess?: () => void,
  onError?: (err: unknown) => void,
) {
  try {
    if (navigator.share) {
      await navigator.share(options);
      onSuccess?.();
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(options.url || window.location.href);
      onSuccess?.();
    } else {
      // Fallback: manual copy to clipboard using temporary textarea
      const textToCopy = options.url || window.location.href;
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        onSuccess?.();
      } catch {
        // Ultimate fallback: let the caller handle this through onError
        onError?.(
          new Error('Sharing not supported in this browser. Please copy the URL manually.'),
        );
      }
    }
  } catch (err) {
    onError?.(err);
  }
}

/**
 * Shares the app's main URL and title.
 */
export function shareApp(onSuccess?: () => void, onError?: (err: unknown) => void) {
  share(
    {
      title: 'Worktime',
      text: 'Check out Worktime for 24/7 shift tracking and time-off management!',
      url: `${window.location.origin}${window.location.pathname}`,
    },
    onSuccess,
    onError,
  );
}

/**
 * Shares the app with additional context (e.g., team, date, view).
 * @param contextText Additional context to include in the share text
 * @param queryParams Optional query parameters to add to the URL for deep linking
 */
export function shareAppWithContext(
  contextText: string,
  onSuccess?: () => void,
  onError?: (err: unknown) => void,
  queryParams?: Record<string, string>,
) {
  let shareUrl = window.location.href;

  // Add query parameters for deep linking if provided
  if (queryParams && Object.keys(queryParams).length > 0) {
    const url = new URL(window.location.href);
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    shareUrl = url.toString();
  }

  share(
    {
      title: 'Worktime',
      text: `Worktime: ${contextText}`,
      url: shareUrl,
    },
    onSuccess,
    onError,
  );
}

/**
 * Shares a specific team's schedule with deep linking
 * @param teamNumber The team number to share
 * @param date Optional specific date to share
 */
export function shareTeamSchedule(
  teamNumber: number,
  onSuccess?: () => void,
  onError?: (err: unknown) => void,
  date?: string,
) {
  const queryParams: Record<string, string> = {
    tab: 'schedule',
    team: teamNumber.toString(),
  };

  if (date) {
    queryParams.date = date;
  }

  shareAppWithContext(
    `Team ${teamNumber} schedule${date ? ` for ${date}` : ''}`,
    onSuccess,
    onError,
    queryParams,
  );
}

/**
 * Shares today's view with all teams
 */
export function shareTodayView(onSuccess?: () => void, onError?: (err: unknown) => void) {
  shareAppWithContext("Today's shift schedule - see who's working now", onSuccess, onError, {
    tab: 'today',
  });
}

/**
 * Shares transfer information for a specific team
 * @param teamNumber The team number for transfer context
 */
export function shareTransferView(
  teamNumber: number,
  onSuccess?: () => void,
  onError?: (err: unknown) => void,
) {
  shareAppWithContext(`Team ${teamNumber} transfer schedule`, onSuccess, onError, {
    tab: 'transfer',
    team: teamNumber.toString(),
  });
}
