import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { useThemeStore } from '@/store/useThemeStore';
import { lightTheme, darkTheme } from '@/theme';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProductListPage from '@/pages/products/ProductListPage';
import ProductDetailPage from '@/pages/products/ProductDetailPage';
import PublicPassportPage from '@/pages/products/PublicPassportPage';
import SystemMetricsPage from '@/pages/metrics/SystemMetricsPage';
import UsersPage from '@/pages/users/UsersPage';
import AuditLogPage from '@/pages/audit/AuditLogPage';
import SettingsPage from '@/pages/settings/SettingsPage';
export default function App() {
  const { theme } = useThemeStore();
  const activeTheme = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ConfigProvider theme={activeTheme} componentSize="large">
      <AntApp>
        <BrowserRouter>
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
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
