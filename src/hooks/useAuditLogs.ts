import { useState, useCallback } from 'react';
import { getAuditLogs } from '@/api/auditLogs';
import type { AuditLog, PaginatedResponse, AuditLogFilters } from '@/types';

interface UseAuditLogsResult {
  data: PaginatedResponse<AuditLog> | null;
  loading: boolean;
  error: string | null;
  fetch: (filters?: AuditLogFilters) => Promise<void>;
}

export function useAuditLogs(initialFilters?: AuditLogFilters): UseAuditLogsResult {
  const [data, setData] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (filters?: AuditLogFilters) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAuditLogs(filters ?? initialFilters);
        setData(res.data);
      } catch {
        setError('Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    },
    [initialFilters],
  );

  return { data, loading, error, fetch };
}
