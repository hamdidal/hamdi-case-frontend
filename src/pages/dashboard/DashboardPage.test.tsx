import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './DashboardPage';
import type { DashboardStatItem } from '@/types';

// ─── Module mocks ─────────────────────────────────────────────────────────────

// Mock the API so tests never hit the network.
const mockGetDashboardStats = vi.fn();
vi.mock('@/api/products', () => ({
  getDashboardStats: (...args: unknown[]) => mockGetDashboardStats(...args),
}));

// Stub react-i18next with minimal translate-key-as-label behaviour.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Recharts uses ResizeObserver and SVG internals not available in jsdom.
// Replace chart containers with plain divs so the component tree renders
// without crashing, while still testing the data-binding logic.
vi.mock('recharts', () => {
  const MockContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  );
  return {
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="bar-chart">{children}</div>
    ),
    Bar: () => null,
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Pie: () => null,
    Cell: () => null,
    AreaChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="area-chart">{children}</div>
    ),
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ResponsiveContainer: MockContainer,
  };
});

// Icon stubs
vi.mock('@/components/common/icons', () => ({
  IconBox: () => <svg data-testid="icon-box" />,
  IconTag: () => <svg data-testid="icon-tag" />,
  IconDashboard: () => <svg data-testid="icon-dashboard" />,
  IconActivity: () => <svg data-testid="icon-activity" />,
}));

vi.mock('@/utils/constants', () => ({
  PIE_COLORS: ['#000', '#fff'],
}));

vi.mock('@/utils/formatters', () => ({
  getLast6Months: () => [
    { name: 'Jan', year: 2025, month: 0 },
    { name: 'Feb', year: 2025, month: 1 },
    { name: 'Mar', year: 2025, month: 2 },
    { name: 'Apr', year: 2025, month: 3 },
    { name: 'May', year: 2025, month: 4 },
    { name: 'Jun', year: 2025, month: 5 },
  ],
  capitalize: (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
}));

// ─── Test data ────────────────────────────────────────────────────────────────

const fixedDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago

const mockStats: DashboardStatItem[] = [
  {
    category: 'ceket',
    brand: 'EcoWear',
    createdAt: fixedDate,
    materials: [{ name: 'Cotton', percentage: 60 }, { name: 'Polyester', percentage: 40 }],
  },
  {
    category: 't-shirt',
    brand: 'SoftRoot',
    createdAt: fixedDate,
    materials: [{ name: 'Bamboo Viscose', percentage: 95 }, { name: 'Elastan', percentage: 5 }],
  },
  {
    category: 'ceket',
    brand: 'ReForm',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    materials: [{ name: 'Recycled Denim', percentage: 100 }],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockGetDashboardStats.mockReset();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DashboardPage — loading state', () => {
  it('shows skeleton placeholders while data is loading', () => {
    // Never-resolving promise keeps the component in the loading state.
    mockGetDashboardStats.mockReturnValue(new Promise(() => {}));
    render(<DashboardPage />);
    const skeletons = document.querySelectorAll('.skeleton-stat-val');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('DashboardPage — error state', () => {
  it('shows an error alert when the API rejects', async () => {
    mockGetDashboardStats.mockRejectedValue(new Error('Network error'));
    render(<DashboardPage />);
    await waitFor(() => {
      // The error key "common.error" is returned as-is by the stub translator.
      expect(screen.getByText('common.error')).toBeInTheDocument();
    });
  });
});

describe('DashboardPage — data loaded', () => {
  beforeEach(() => {
    mockGetDashboardStats.mockResolvedValue({ data: { data: mockStats } });
  });

  it('displays the correct total product count (3)', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const label = screen.getByText('dashboard.totalProducts');
      const card = label.closest('.stat');
      expect(card?.querySelector('.stat-value')?.textContent).toBe('3');
    });
  });

  it('displays the correct distinct category count (2: ceket, t-shirt)', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      const label = screen.getByText('dashboard.totalCategories');
      const card = label.closest('.stat');
      expect(card?.querySelector('.stat-value')?.textContent).toBe('2');
    });
  });

  it('renders chart containers after data loads', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getAllByTestId('chart-container').length).toBeGreaterThan(0);
    });
  });

  it('does not show the empty state when products exist', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      // antd Empty component is absent when products are present.
      expect(screen.queryByRole('img', { name: /empty/i })).not.toBeInTheDocument();
    });
  });
});

describe('DashboardPage — empty data', () => {
  it('shows the Empty component when the API returns no products', async () => {
    mockGetDashboardStats.mockResolvedValue({ data: { data: [] } });
    render(<DashboardPage />);
    await waitFor(() => {
      // The Empty component from antd renders a <div> with class "ant-empty".
      const empty = document.querySelector('.ant-empty');
      expect(empty).toBeInTheDocument();
    });
  });
});
