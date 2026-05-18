import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { IconMenu, IconChevronRight } from '@/components/common/icons';
import { AppImage } from '@/components/common/AppImage';

interface HeaderProps {
  onToggle: () => void;
}

interface Crumb {
  label: string;
  path: string;
}

function useBreadcrumbs(): Crumb[] {
  const location = useLocation();
  const { t } = useTranslation();

  const path = location.pathname;
  if (path.startsWith('/products/')) return [
    { label: t('nav.products'), path: '/products' },
    { label: t('editor.title'), path: location.pathname },
  ];
  if (path.startsWith('/products'))  return [{ label: t('nav.products'),  path: '/products' }];
  if (path.startsWith('/dashboard')) return [{ label: t('nav.dashboard'), path: '/dashboard' }];
  if (path.startsWith('/metrics'))   return [{ label: t('nav.metrics'),   path: '/metrics' }];
  if (path.startsWith('/users'))     return [{ label: t('nav.users'),     path: '/users' }];
  if (path.startsWith('/audit'))     return [{ label: t('nav.audit'),     path: '/audit' }];
  if (path.startsWith('/settings'))  return [{ label: t('nav.settings'),  path: '/settings' }];
  return [];
}

export function Header({ onToggle }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const crumbs = useBreadcrumbs();
  const isAdmin = user?.role === 'admin';

  const dropdownItems: MenuProps['items'] = [
    ...(isAdmin ? [
      {
        key: 'settings',
        label: t('nav.settings'),
        icon: <SettingOutlined />,
      },
      { type: 'divider' as const },
    ] : []),
    {
      key: 'logout',
      label: t('common.logout'),
      icon: <LogoutOutlined />,
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
    <div className="header">
      <span className="header-action" onClick={onToggle} role="button" aria-label="Toggle sidebar">
        <IconMenu size={17} />
      </span>

      <div className="crumbs">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="crumb-fragment">
              {i > 0 && <IconChevronRight size={13} className="crumb-sep" />}
              {isLast ? (
                <span className="crumb-current">{crumb.label}</span>
              ) : (
                <span
                  className="crumb-link"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(crumb.path)}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <div className="header-spacer" />

      <LanguageSwitcher />

      <ThemeToggle />

      <Dropdown
        menu={{ items: dropdownItems, onClick: handleMenuClick }}
        trigger={['click']}
        placement="bottomRight"
      >
        <div className="header-user">
          <AppImage variant="user" className="header-user-avatar" alt={user?.username ?? ''} />
          <span className="header-username">
            {user?.username?.split('.')[0] ?? 'User'}
          </span>
        </div>
      </Dropdown>
    </div>
  );
}
