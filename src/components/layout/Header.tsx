import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import {
  IconMenu, IconSearch, IconBell,
  IconSettings, IconEye, IconLogout, IconChevronRight,
} from '@/components/common/icons';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

function useBreadcrumbs(): string[] {
  const location = useLocation();
  const { t } = useTranslation();

  const path = location.pathname;
  if (path.startsWith('/products/')) return [t('nav.products'), t('editor.title')];
  if (path.startsWith('/products'))  return [t('nav.products')];
  if (path.startsWith('/dashboard')) return [t('nav.dashboard')];
  if (path.startsWith('/metrics'))   return [t('nav.metrics')];
  if (path.startsWith('/users'))     return [t('nav.users')];
  if (path.startsWith('/audit'))     return [t('nav.audit')];
  if (path.startsWith('/settings'))  return [t('nav.settings')];
  return [];
}

export function Header({ collapsed, onToggle }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const crumbs = useBreadcrumbs();
  const [searchVal, setSearchVal] = useState('');

  const getInitials = (name: string) =>
    name.split('.').map((p) => p[0]?.toUpperCase() ?? '').join('').slice(0, 2);

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: t('common.profile'),
      icon: <IconEye size={14} />,
    },
    {
      key: 'settings',
      label: t('nav.settings'),
      icon: <IconSettings size={14} />,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: t('common.logout'),
      icon: <IconLogout size={14} />,
      danger: true,
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      clearAuth();
      navigate('/login');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <div className="app-header">
      {/* Sidebar toggle */}
      <span className="header-action" onClick={onToggle} role="button" aria-label="Toggle sidebar">
        <IconMenu size={17} style={{ transform: collapsed ? 'rotate(90deg)' : undefined, transition: 'transform 0.18s' }} />
      </span>

      {/* Breadcrumbs */}
      <div className="crumbs">
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: 'contents' }}>
            {i > 0 && <IconChevronRight size={13} className="crumb-sep" />}
            <span className={i === crumbs.length - 1 ? 'crumb-current' : ''}>{crumb}</span>
          </span>
        ))}
      </div>

      <div className="header-spacer" />

      {/* Search */}
      <div className="search-input">
        <IconSearch size={14} className="search-icon" />
        <input
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder={t('common.quickSearch')}
        />
      </div>

      {/* Language + Theme + Notifications */}
      <LanguageSwitcher />

      <span className="header-action" role="button" aria-label={t('common.notifications')}>
        <IconBell size={17} />
      </span>

      <ThemeToggle />

      {/* Avatar dropdown */}
      <Dropdown
        menu={{ items: dropdownItems, onClick: handleMenuClick }}
        trigger={['click']}
        placement="bottomRight"
      >
        <div className="header-user">
          <div className="header-user-avatar">
            {getInitials(user?.username ?? 'U')}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
            {user?.username?.split('.')[0] ?? 'User'}
          </span>
        </div>
      </Dropdown>
    </div>
  );
}
