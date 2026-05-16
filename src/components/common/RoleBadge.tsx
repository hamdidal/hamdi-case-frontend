import { useTranslation } from 'react-i18next';
import type { Role } from '@/types';

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const { t } = useTranslation();

  if (role === 'admin') {
    return (
      <span className="tag role-admin">
        <span className="tag-dot" />
        {t('users.roles.admin')}
      </span>
    );
  }

  return (
    <span className="tag role-auditor">
      <span className="tag-dot" />
      {t('users.roles.auditor')}
    </span>
  );
}
