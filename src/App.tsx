import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import { useThemeStore } from '@/store/useThemeStore';
import { useLoadingStore } from '@/store/useLoadingStore';
import { lightTheme, darkTheme } from '@/theme';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ProductListPage = lazy(() => import('@/pages/products/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'));
const PublicPassportPage = lazy(() => import('@/pages/products/PublicPassportPage'));
const SystemMetricsPage = lazy(() => import('@/pages/metrics/SystemMetricsPage'));
const UsersPage = lazy(() => import('@/pages/users/UsersPage'));
const AuditLogPage = lazy(() => import('@/pages/audit/AuditLogPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <Spin size="large" />
  </div>
);

function GlobalSpinner() {
  // Selector computes a boolean — re-renders only on false↔true transitions,
  // not on every counter increment/decrement.
  const isLoading = useLoadingStore((s) => s.activeRequests > 0);
  // delay prevents flickering for sub-200ms requests
  return <Spin fullscreen spinning={isLoading} delay={200} />;
}

export default function App() {
  const theme = useThemeStore((s) => s.theme);
  const activeTheme = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ConfigProvider theme={activeTheme} componentSize="large">
      <AntApp>
        <GlobalSpinner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/p/:uuid"  element={<PublicPassportPage />} />

            <Route element={<PrivateRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"     element={<DashboardPage />} />
                <Route path="/products"      element={<ProductListPage />} />
                <Route path="/products/:id"  element={<ProductDetailPage />} />
                <Route path="/metrics"       element={<SystemMetricsPage />} />

                <Route element={<PrivateRoute requiredRole="admin" />}>
                  <Route path="/users"    element={<UsersPage />} />
                  <Route path="/audit"    element={<AuditLogPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
