import axios from 'axios';
import type { MetricResult } from '@/types';
import { attachLoadingInterceptors } from './interceptors';

const AUTH_STORAGE_KEY = 'dpp-auth';

const metricsClient = axios.create({
  baseURL: (import.meta.env.VITE_METRICS_BASE_URL as string) || '/api/metrics-proxy',
  headers: { 'Content-Type': 'application/json' },
});

attachLoadingInterceptors(metricsClient);

metricsClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
      const token = parsed.state?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
    }
  }
  return config;
});

export const PROMQL = {
  cpu: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
  ram: '(1 - node_memory_MemAvailable_bytes/node_memory_MemTotal_bytes) * 100',
  disk: '(1 - node_filesystem_avail_bytes{mountpoint="/"}/node_filesystem_size_bytes{mountpoint="/"}) * 100',
  networkIn: 'rate(node_network_receive_bytes_total{device="eth0"}[5m])',
  networkOut: 'rate(node_network_transmit_bytes_total{device="eth0"}[5m])',
} as const;

export function queryMetric(query: string) {
  return metricsClient.get<MetricResult>('metrics/query', { params: { query } });
}

export function checkHealth() {
  return metricsClient.get<{ status: string }>('health');
}
