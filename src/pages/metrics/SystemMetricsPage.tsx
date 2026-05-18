import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Progress, Alert, Spin } from 'antd';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { queryMetric, PROMQL } from '@/api/metrics';
import { formatBytesPerSecond } from '@/utils/formatBytes';

interface NetPoint {
  time: string;
  netIn: number;
  netOut: number;
}

interface MetricValues {
  cpu: number;
  ram: number;
  disk: number;
  netIn: number;
  netOut: number;
}

function GaugeCard({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="card gauge-card-inner">
      <div className="stat-label mb-16">{label}</div>
      {loading ? (
        <div className="skeleton skeleton-gauge" />
      ) : (
        <Progress
          type="circle"
          percent={Math.round(Math.min(Math.max(value, 0), 100))}
          strokeColor="#2D6A4F"
          size={120}
        />
      )}
      <div className="gauge-percent">
        {loading ? '—' : `${(value ?? 0).toFixed(1)}%`}
      </div>
    </div>
  );
}

interface NetPayloadItem {
  name?: string;
  value?: number;
  color?: string;
}

interface NetTooltipProps {
  active?: boolean;
  payload?: NetPayloadItem[];
  label?: string;
}

function NetTooltip({ active, payload, label }: NetTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card chart-tt-sm">
      <div className="chart-tt-lbl">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color ?? 'var(--text)' }}>
          {p.name}: {formatBytesPerSecond(p.value ?? 0)}
        </div>
      ))}
    </div>
  );
}

const INIT: MetricValues = { cpu: 0, ram: 0, disk: 0, netIn: 0, netOut: 0 };

async function fetchNetworkValues(): Promise<{ netIn: number; netOut: number }> {
  try {
    const [netIn, netOut] = await Promise.all([
      queryMetric(PROMQL.networkIn),
      queryMetric(PROMQL.networkOut),
    ]);
    return { netIn: netIn.data.value, netOut: netOut.data.value };
  } catch {
    const [netIn, netOut] = await Promise.all([
      queryMetric('rate(node_network_receive_bytes_total[5m])'),
      queryMetric('rate(node_network_transmit_bytes_total[5m])'),
    ]);
    return { netIn: netIn.data.value, netOut: netOut.data.value };
  }
}

function padTwo(n: number) { return String(n).padStart(2, '0'); }

export default function SystemMetricsPage() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<MetricValues>(INIT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [networkHistory, setNetworkHistory] = useState<NetPoint[]>([]);
  const historyRef = useRef<NetPoint[]>([]);

  const fetchAllRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const fetchAll = async () => {
    try {
      const [cpu, ram, disk, net] = await Promise.all([
        queryMetric(PROMQL.cpu),
        queryMetric(PROMQL.ram),
        queryMetric(PROMQL.disk),
        fetchNetworkValues(),
      ]);

      setMetrics({
        cpu: cpu.data.value ?? 0,
        ram: ram.data.value ?? 0,
        disk: disk.data.value ?? 0,
        netIn: net.netIn ?? 0,
        netOut: net.netOut ?? 0,
      });

      const now = new Date();
      const timeLabel = `${padTwo(now.getHours())}:${padTwo(now.getMinutes())}:${padTwo(now.getSeconds())}`;

      setLastUpdate(timeLabel);
      setError(null);

      const point: NetPoint = { time: timeLabel, netIn: net.netIn ?? 0, netOut: net.netOut ?? 0 };
      const updated = [...historyRef.current, point].slice(-20);
      historyRef.current = updated;
      setNetworkHistory([...updated]);
    } catch {
      setError(t('metrics.queryError'));
    } finally {
      setLoading(false);
    }
  };

  fetchAllRef.current = fetchAll;

  useEffect(() => {
    fetchAllRef.current?.();
    const interval = setInterval(() => {
      fetchAllRef.current?.();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('metrics.title')}</h1>
          <p className="page-subtitle">{t('metrics.subtitle')}</p>
        </div>
        {lastUpdate && (
          <div className="metric-update">
            {t('common.lastUpdated')}: {lastUpdate}
          </div>
        )}
      </div>

      {error && (
        <Alert type="error" title={error} showIcon className="mb-20" />
      )}

      <div className="gauge-grid">
        <GaugeCard label={t('metrics.cpu')} value={metrics.cpu} loading={false} />
        <GaugeCard label={t('metrics.ram')} value={metrics.ram} loading={false} />
        <GaugeCard label={t('metrics.disk')} value={metrics.disk} loading={false} />
      </div>

      <div className="card card-mt">
        <div className="card-head">
          <span className="card-title">{t('metrics.network')}</span>
          <span className="card-sub">{t('metrics.autoRefresh')}</span>
        </div>
        <div className="card-body chart-h-240">
          {networkHistory.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Spin size="large" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={networkHistory} margin={{ top: 4, right: 4, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis
                  tickFormatter={(v: number) => formatBytesPerSecond(v, 0)}
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  width={72}
                />
                <Tooltip content={<NetTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="netIn"
                  name={t('metrics.networkIn')}
                  stroke="#2D6A4F"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="netOut"
                  name={t('metrics.networkOut')}
                  stroke="#C97C2A"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
