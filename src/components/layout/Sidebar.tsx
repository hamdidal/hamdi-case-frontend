import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { RoleBadge } from '@/components/common/RoleBadge';
import {
  IconDashboard, IconBox, IconActivity,
  IconUsers, IconShield, IconSettings,
} from '@/components/common/icons';
import type { Role } from '@/types';
import type { ReactNode } from 'react';

interface SidebarProps {
  collapsed: boolean;
}

interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
  to: string;
  adminOnly?: boolean;
}

interface NavSection {
  group: string;
  adminOnly?: boolean;
  items: NavItem[];
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role ?? 'auditor';

  const sections: NavSection[] = [
    {
      group: t('nav.section.main'),
      items: [
        { key: 'dashboard', label: t('nav.dashboard'), icon: <IconDashboard size={17} />, to: '/dashboard' },
        { key: 'products',  label: t('nav.products'),  icon: <IconBox size={17} />,       to: '/products'  },
      ],
    },
    {
      group: t('nav.section.system'),
      items: [
        { key: 'metrics', label: t('nav.metrics'), icon: <IconActivity size={17} />, to: '/metrics' },
      ],
    },
    {
      group: t('nav.section.admin'),
      adminOnly: true,
      items: [
        { key: 'users',    label: t('nav.users'),    icon: <IconUsers size={17} />,    to: '/users',    adminOnly: true },
        { key: 'audit',    label: t('nav.audit'),    icon: <IconShield size={17} />,   to: '/audit',    adminOnly: true },
        { key: 'settings', label: t('nav.settings'), icon: <IconSettings size={17} />, to: '/settings', adminOnly: true },
      ],
    },
  ];

  const isActive = (to: string) =>
    location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to + '/'));

  const getInitials = (name: string) =>
    name.split('.').map((p) => p[0]?.toUpperCase() ?? '').join('').slice(0, 2);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand */}
      <div className="side-brand">
        <div className="side-brand-mark" />
        {!collapsed && (
          <div className="side-brand-text">
            VeriPass
            <small>DPP Paneli</small>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="side-nav">
        {sections.map((sec) => {
          if (sec.adminOnly && role !== 'admin') return null;
          return (
            <div key={sec.group}>
              {!collapsed && (
                <div className="side-section-label">{sec.group}</div>
              )}
              {sec.items.map((item) => {
                if (item.adminOnly && role !== 'admin') return null;
                const active = isActive(item.to);
                return (
                  <div
                    key={item.key}
                    className={`side-item${collapsed ? ' side-item-icon-only' : ''}`}
                    data-active={active}
                    title={collapsed ? item.label : undefined}
                    onClick={() => navigate(item.to)}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="side-foot">
        <div className="side-foot-avatar">
          {getInitials(user?.username ?? 'user')}
        </div>
        {!collapsed && (
          <div className="side-foot-info">
            <span className="side-foot-name">{user?.username ?? '—'}</span>
            <RoleBadge role={role as Role} />
          </div>
        )}
      </div>
    </div>
  );
}
