import { useState, useCallback } from 'react';
import { queryMetric, PROMQL } from '@/api/metrics';

export interface MetricsSnapshot {
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  networkIn: number | null;
  networkOut: number | null;
  lastUpdated: Date | null;
}

interface UseMetricsResult {
  metrics: MetricsSnapshot;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

async function safeQuery(query: string): Promise<number | null> {
  try {
    const res = await queryMetric(query);
    return res.data.value;
  } catch {
    return null;
  }
}

export function useMetrics(): UseMetricsResult {
  const [metrics, setMetrics] = useState<MetricsSnapshot>({
    cpu: null,
    ram: null,
    disk: null,
    networkIn: null,
    networkOut: null,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cpu, ram, disk, networkIn, networkOut] = await Promise.all([
        safeQuery(PROMQL.cpu),
        safeQuery(PROMQL.ram),
        safeQuery(PROMQL.disk),
        safeQuery(PROMQL.networkIn),
        safeQuery(PROMQL.networkOut),
      ]);
      setMetrics({ cpu, ram, disk, networkIn, networkOut, lastUpdated: new Date() });
    } catch {
      setError('Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  return { metrics, loading, error, refresh };
}
