import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'antd';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getProducts } from '@/api/products';
import type { Product } from '@/types';
import { IconBox, IconTag, IconDashboard, IconActivity } from '@/components/common/icons';

const PIE_COLORS = ['#2D6A4F', '#40916C', '#74C69D', '#B7E4C7', '#52B788', '#1B4332'];
const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

// ── Data computations ─────────────────────────────────────────────────────────

function computeStats(products: Product[]) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return {
    total: products.length,
    brands: new Set(products.map((p) => p.brand)).size,
    categories: new Set(products.map((p) => p.category)).size,
    lastWeek: products.filter((p) => new Date(p.createdAt) >= sevenDaysAgo).length,
  };
}

function computeByCategory(products: Product[]) {
  const map = new Map<string, number>();
  for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

function computeByMaterial(products: Product[]) {
  const map = new Map<string, number>();
  for (const p of products) {
    for (const m of (p.materials ?? [])) {
      map.set(m.name, (map.get(m.name) ?? 0) + m.percentage);
    }
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value: Math.round(value) }));
}

function computeByMonth(products: Product[]) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { name: TR_MONTHS[d.getMonth()], count: 0, year: d.getFullYear(), month: d.getMonth() };
  });
  for (const p of products) {
    const d = new Date(p.createdAt);
    const idx = months.findIndex((m) => m.year === d.getFullYear() && m.month === d.getMonth());
    if (idx !== -1) months[idx].count++;
  }
  return months.map(({ name, count }) => ({ name, count }));
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

function ChartSkeleton() {
  return <div className="skeleton" style={{ height: '100%', borderRadius: 8 }} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getProducts({ limit: 1000 })
      .then((res) => setProducts(res.data.data ?? []))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  const stats = computeStats(products);
  const byCategory = computeByCategory(products);
  const byMaterial = computeByMaterial(products);
  const byMonth = computeByMonth(products);

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

      {/* Stat cards */}
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

      {/* Charts */}
      <div className="dash-charts">
        {/* Bar — by category */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">{t('dashboard.byCategory')}</span>
          </div>
          <div className="card-body" style={{ height: 220 }}>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="#2D6A4F" activeBar={{ fill: '#40916C' }} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut — by material */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">{t('dashboard.byMaterial')}</span>
          </div>
          <div className="card-body" style={{ height: 220 }}>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byMaterial}
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                  >
                    {byMaterial.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Area — by month */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">{t('dashboard.byMonth')}</span>
          </div>
          <div className="card-body" style={{ height: 220 }}>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={byMonth} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
