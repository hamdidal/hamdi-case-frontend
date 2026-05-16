import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// ── Placeholder pages ─────────────────────────────────────────────────────────
// Each will be replaced with the real page component in a subsequent step.

// ── Router ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no layout */}
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/p/:uuid"   element={<PublicPassportPage />} />

        {/* Protected routes — requires auth */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"     element={<DashboardPage />} />
            <Route path="/products"      element={<ProductListPage />} />
            <Route path="/products/:id"  element={<ProductDetailPage />} />
            <Route path="/metrics"       element={<SystemMetricsPage />} />

            {/* Admin-only routes */}
            <Route element={<PrivateRoute requiredRole="admin" />}>
              <Route path="/users"    element={<UsersPage />} />
              <Route path="/audit"    element={<AuditLogPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
