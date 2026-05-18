import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { IconMenu, IconChevronRight } from '@/components/common/icons';

interface HeaderProps {
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

export function Header({ onToggle }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const crumbs = useBreadcrumbs();
  const isAdmin = user?.role === 'admin';

  const getInitials = (name: string) =>
    name.split('.').map((p) => p[0]?.toUpperCase() ?? '').join('').slice(0, 2);

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
        {crumbs.map((crumb, i) => (
          <span key={i} className="crumb-fragment">
            {i > 0 && <IconChevronRight size={13} className="crumb-sep" />}
            <span className={i === crumbs.length - 1 ? 'crumb-current' : ''}>{crumb}</span>
          </span>
        ))}
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
          <div className="header-user-avatar">
            {getInitials(user?.username ?? 'U')}
          </div>
          <span className="header-username">
            {user?.username?.split('.')[0] ?? 'User'}
          </span>
        </div>
      </Dropdown>
    </div>
  );
}
