import client from './client';
import type { MetricResult } from '@/types';

export const PROMQL = {
  cpu: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
  ram: '(1 - node_memory_MemAvailable_bytes/node_memory_MemTotal_bytes) * 100',
  disk: '(1 - node_filesystem_avail_bytes{mountpoint="/"}/node_filesystem_size_bytes{mountpoint="/"}) * 100',
  networkIn: 'rate(node_network_receive_bytes_total{device="eth0"}[5m])',
  networkOut: 'rate(node_network_transmit_bytes_total{device="eth0"}[5m])',
} as const;

export function queryMetric(query: string) {
  return client.get<MetricResult>('metrics/query', { params: { query } });
}

export function checkHealth() {
  return client.get<{ status: string }>('health');
}
