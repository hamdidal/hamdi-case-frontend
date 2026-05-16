import type { CSSProperties } from 'react';
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

export interface SidebarProps {
  collapsed: boolean;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
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

export function Sidebar({ collapsed, isMobile, mobileOpen, onMobileClose }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role ?? 'auditor';

  const iconOnly = collapsed && !isMobile;
  const width = iconOnly ? 64 : 240;

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

  const handleNav = (to: string) => {
    navigate(to);
    if (isMobile) onMobileClose();
  };

  const sidebarStyle: CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: 240,
        zIndex: 100,
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-fg)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--sidebar-border)',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.18s ease',
      }
    : {
        width,
        flexShrink: 0,
        height: '100%',
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-fg)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--sidebar-border)',
        transition: 'width 0.18s ease',
        overflow: 'hidden',
      };

  return (
    <aside style={sidebarStyle}>
      {/* Brand */}
      <div className="side-brand">
        <div className="side-brand-mark" />
        {!iconOnly && (
          <div className="side-brand-text">
            Kobe
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
              {!iconOnly && (
                <div className="side-section-label">{sec.group}</div>
              )}
              {sec.items.map((item) => {
                if (item.adminOnly && role !== 'admin') return null;
                const active = isActive(item.to);
                return (
                  <div
                    key={item.key}
                    className="side-item"
                    data-active={active}
                    title={iconOnly ? item.label : undefined}
                    style={iconOnly ? { justifyContent: 'center', padding: '10px 0' } : undefined}
                    onClick={() => handleNav(item.to)}
                  >
                    {item.icon}
                    {!iconOnly && <span className="side-label">{item.label}</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="side-foot" style={iconOnly ? { padding: '12px 8px' } : undefined}>
        <div className="side-foot-avatar">
          {getInitials(user?.username ?? 'user')}
        </div>
        {!iconOnly && (
          <div className="side-foot-info">
            <span className="side-foot-name">{user?.username ?? '—'}</span>
            <span className="side-foot-role">
              <RoleBadge role={role as Role} />
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
