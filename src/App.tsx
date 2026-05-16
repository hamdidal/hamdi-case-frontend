import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import { useTranslation } from 'react-i18next';

// ── Placeholder pages ─────────────────────────────────────────────────────────
// Each will be replaced with the real page component in a subsequent step.

function PlaceholderPage({ name }: { name: string }) {
  const { t } = useTranslation();
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{name}</h1>
          <p className="page-subtitle">{t('common.loading')}</p>
        </div>
      </div>
    </div>
  );
}

function LoginPage()         { return <PlaceholderPage name="Login" />; }
function RegisterPage()      { return <PlaceholderPage name="Register" />; }
function PublicPassportPage(){ return <PlaceholderPage name="Public Passport" />; }
function DashboardPage()     { return <PlaceholderPage name="Dashboard" />; }
function ProductListPage()   { return <PlaceholderPage name="Products" />; }
function ProductDetailPage() { return <PlaceholderPage name="Product Detail" />; }
function MetricsPage()       { return <PlaceholderPage name="System Metrics" />; }
function UsersPage()         { return <PlaceholderPage name="Users & Roles" />; }
function AuditLogPage()      { return <PlaceholderPage name="Audit Log" />; }
function SettingsPage()      { return <PlaceholderPage name="Settings" />; }

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
            <Route path="/metrics"       element={<MetricsPage />} />

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
