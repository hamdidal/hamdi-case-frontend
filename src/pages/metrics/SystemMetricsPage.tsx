import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Progress, Alert } from 'antd';
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
        {loading ? '—' : `${value.toFixed(1)}%`}
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

export default function SystemMetricsPage() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<MetricValues>(INIT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [networkHistory, setNetworkHistory] = useState<NetPoint[]>([]);
  const historyRef = useRef<NetPoint[]>([]);

  const fetchAll = useCallback(async () => {
    try {
      const [cpu, ram, disk, netIn, netOut] = await Promise.all([
        queryMetric(PROMQL.cpu),
        queryMetric(PROMQL.ram),
        queryMetric(PROMQL.disk),
        queryMetric(PROMQL.networkIn),
        queryMetric(PROMQL.networkOut),
      ]);

      setMetrics({
        cpu: cpu.data.value,
        ram: ram.data.value,
        disk: disk.data.value,
        netIn: netIn.data.value,
        netOut: netOut.data.value,
      });

      const now = new Date();
      const timeLabel = now.toLocaleTimeString('tr-TR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });

      setLastUpdate(timeLabel);
      setError(null);

      const point: NetPoint = { time: timeLabel, netIn: netIn.data.value, netOut: netOut.data.value };
      const updated = [...historyRef.current, point].slice(-20);
      historyRef.current = updated;
      setNetworkHistory([...updated]);
    } catch {
      setError(t('metrics.queryError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchAll();
    const interval = setInterval(() => void fetchAll(), 15000);
    return () => clearInterval(interval);
  }, [fetchAll]);

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
        <Alert type="warning" title={error} showIcon className="mb-20" />
      )}

      <div className="gauge-grid">
        <GaugeCard label={t('metrics.cpu')} value={metrics.cpu} loading={loading} />
        <GaugeCard label={t('metrics.ram')} value={metrics.ram} loading={loading} />
        <GaugeCard label={t('metrics.disk')} value={metrics.disk} loading={loading} />
      </div>

      <div className="card card-mt">
        <div className="card-head">
          <span className="card-title">{t('metrics.network')}</span>
          <span className="card-sub">{t('metrics.autoRefresh')}</span>
        </div>
        <div className="card-body chart-h-240">
          {loading ? (
            <div className="skeleton skeleton-chart-fill" />
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
