import client from './client';
import type { AuditLog, PaginatedResponse, AuditLogFilters } from '@/types';

export function getAuditLogs(filters?: AuditLogFilters) {
  return client.get<PaginatedResponse<AuditLog>>('/audit-logs', { params: filters });
}
