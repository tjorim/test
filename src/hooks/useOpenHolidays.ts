import { useEffect, useState } from "react";

interface UseOpenHolidaysOptions {
  endpoint: string;
  params: Record<string, string>;
  enabled: boolean;
  responseErrorPrefix: string;
  timeoutError: string;
  networkError: string;
  unknownError: string;
}

export function useOpenHolidays<T>({
  endpoint,
  params,
  enabled,
  responseErrorPrefix,
  timeoutError,
  networkError,
  unknownError,
}: UseOpenHolidaysOptions) {
  const [holidays, setHolidays] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setHolidays([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchHolidays = async () => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams(params);
        const response = await fetch(`https://openholidaysapi.org/${endpoint}?${searchParams}`, {
          headers: {
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!cancelled && !response.ok) {
          throw new Error(`${responseErrorPrefix}: ${response.status} ${response.statusText}`);
        }

        if (cancelled) {
          return;
        }

        const data: T[] = await response.json();

        if (!cancelled) {
          setHolidays(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof Error) {
            if (err.name === "AbortError" || err.name === "TimeoutError") {
              setError(timeoutError);
            } else if (err.message.startsWith(responseErrorPrefix)) {
              setError(err.message);
            } else if (err.message.includes("Failed to fetch")) {
              setError(networkError);
            } else {
              setError(err.message);
            }
          } else {
            setError(unknownError);
          }
          setHolidays([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHolidays();

    return () => {
      cancelled = true;
    };
  }, [endpoint, params, enabled, responseErrorPrefix, timeoutError, networkError, unknownError]);

  return { holidays, loading, error };
}
