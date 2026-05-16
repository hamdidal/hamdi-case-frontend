import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Empty } from 'antd';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getDashboardStats } from '@/api/products';
import type { DashboardStatItem } from '@/types';
import { IconBox, IconTag, IconDashboard, IconActivity } from '@/components/common/icons';
import { PIE_COLORS } from '@/utils/constants';
import { getLast6Months, capitalize } from '@/utils/formatters';

function computeStats(products: DashboardStatItem[]) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return {
    total: products.length,
    brands: new Set(products.map((p) => p.brand)).size,
    categories: new Set(products.map((p) => p.category)).size,
    lastWeek: products.filter((p) => new Date(p.createdAt) >= sevenDaysAgo).length,
  };
}

function computeByCategory(products: DashboardStatItem[]) {
  if (!products || !Array.isArray(products) || products.length === 0) return [];
  const map = new Map<string, number>();
  for (const p of products) {
    const cat = capitalize(p.category);
    map.set(cat, (map.get(cat) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

function computeByMaterial(products: DashboardStatItem[]) {
  if (!products || !Array.isArray(products) || products.length === 0) return [];
  const map = new Map<string, number>();
  for (const p of products) {
    for (const m of (p.materials ?? [])) {
      map.set(m.name, (map.get(m.name) ?? 0) + m.percentage);
    }
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value: Math.round(value) }));
}

function computeByMonth(products: DashboardStatItem[], locale?: string) {
  if (!products || !Array.isArray(products) || products.length === 0) return [];
  const months = getLast6Months(locale).map((m) => ({ ...m, count: 0 }));
  for (const p of products) {
    const d = new Date(p.createdAt);
    const idx = months.findIndex((m) => m.year === d.getFullYear() && m.month === d.getMonth());
    if (idx !== -1) months[idx].count++;
  }
  return months.map(({ name, count }) => ({ name, count }));
}

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  loading: boolean;
}

function StatCard({ label, value, icon, loading }: StatCardProps) {
  return (
    <div className="stat">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      {loading ? (
        <div className="skeleton" style={{ height: 28, width: 64, borderRadius: 4 }} />
      ) : (
        <div className="stat-value">{value}</div>
      )}
    </div>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '8px 12px', fontSize: 13, minWidth: 80 }}>
      <div style={{ color: 'var(--text-soft)', marginBottom: 2 }}>{label}</div>
      <div style={{ color: 'var(--text)', fontWeight: 600 }}>{payload[0]?.value}</div>
    </div>
  );
}

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; percent?: number }>;
}

function PieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value, percent } = payload[0];
  return (
    <div className="card" style={{ padding: '8px 14px', fontSize: 13, minWidth: 140 }}>
      <div style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>{name}</div>
      <div style={{ color: 'var(--text-soft)', marginBottom: 2 }}>{value} units</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{Math.round((percent ?? 0) * 100)}%</div>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="skeleton" style={{ height: 400, width: '100%', borderRadius: 8 }} />;
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<DashboardStatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getDashboardStats()
      .then((res) => setProducts(res?.data?.data ?? []))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const stats = computeStats(products);
  const byCategory = computeByCategory(products);
  const byMaterial = computeByMaterial(products);
  const byMonth = computeByMonth(products, locale);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <p className="page-subtitle">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {error && (
        <Alert type="error" title={error} showIcon style={{ marginBottom: 20 }} />
      )}

      <div className="stat-grid">
        <StatCard
          label={t('dashboard.totalProducts')}
          value={stats.total}
          icon={<IconBox size={22} />}
          loading={loading}
        />
        <StatCard
          label={t('dashboard.totalBrands')}
          value={stats.brands}
          icon={<IconTag size={22} />}
          loading={loading}
        />
        <StatCard
          label={t('dashboard.totalCategories')}
          value={stats.categories}
          icon={<IconDashboard size={22} />}
          loading={loading}
        />
        <StatCard
          label={t('dashboard.recentlyAdded')}
          value={stats.lastWeek}
          icon={<IconActivity size={22} />}
          loading={loading}
        />
      </div>

      {!loading && products.length === 0 ? (
        <Empty style={{ padding: '60px 0' }} />
      ) : (
      <div className="dash-charts">
        <div className="card">
          <div className="card-head">
            <span className="card-title">{t('dashboard.byCategory')}</span>
          </div>
          <div className="card-body">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory && byCategory.length > 0 ? byCategory : []} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.ceil(dataMax * 2)]}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="#2D6A4F" activeBar={{ fill: '#40916C' }} radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <span className="card-title">{t('dashboard.byMaterial')}</span>
          </div>
          <div className="card-body">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie
                    data={byMaterial && byMaterial.length > 0 ? byMaterial : []}
                    cx="50%"
                    cy="42%"
                    innerRadius={70}
                    outerRadius={120}
                    dataKey="value"
                    nameKey="name"
                    label={false}
                  >
                    {byMaterial.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: 12,
                      lineHeight: '2',
                      paddingTop: 12,
                      color: 'var(--text)',
                    }}
                    formatter={(value: string) =>
                      value.length > 22 ? value.slice(0, 20) + '…' : value
                    }
                  />
                </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <span className="card-title">{t('dashboard.byMonth')}</span>
          </div>
          <div className="card-body">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={byMonth && byMonth.length > 0 ? byMonth : []} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                  <defs>
                    <linearGradient id="dashGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2D6A4F"
                    strokeWidth={2}
                    fill="url(#dashGradient)"
                  />
                </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
