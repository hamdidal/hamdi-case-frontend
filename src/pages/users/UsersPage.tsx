import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Select, Popconfirm, Tooltip, App } from 'antd';
import type { TableColumnsType } from 'antd';
import { getUsers, updateUserRole, deleteUser } from '@/api/users';
import { useAuthStore } from '@/store/useAuthStore';
import { RoleBadge } from '@/components/common/RoleBadge';
import { IconTrash } from '@/components/common/icons';
import type { User, Role } from '@/types';
import { formatDate } from '@/utils/formatDate';

export default function UsersPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { user: currentUser } = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then((res) => setUsers(res.data ?? []))
      .catch(() => void message.error(t('common.error')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (id: number, role: Role) => {
    try {
      await updateUserRole(id, role);
      void message.success(t('users.updateSuccess'));
      fetchUsers();
    } catch {
      void message.error(t('common.error'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      void message.success(t('users.deleteSuccess'));
      fetchUsers();
    } catch {
      void message.error(t('common.error'));
    }
  };

  const columns: TableColumnsType<User> = [
    {
      title: '',
      key: 'avatar',
      width: 52,
      render: (_, record) => (
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'var(--brand-500)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0,
        }}>
          {record.username[0]?.toUpperCase() ?? 'U'}
        </div>
      ),
    },
    {
      title: t('users.columns.username'),
      dataIndex: 'username',
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: t('users.columns.role'),
      dataIndex: 'role',
      render: (_, record) => <RoleBadge role={record.role} />,
    },
    {
      title: t('users.columns.createdAt'),
      dataIndex: 'createdAt',
      render: (v: string) => <span style={{ color: 'var(--text-soft)' }}>{formatDate(v)}</span>,
    },
    {
      title: t('users.columns.actions'),
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const isSelf = record.id === currentUser?.id;
        return (
          <Tooltip title={isSelf ? t('users.cannotDeleteSelf') : undefined}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Select<Role>
                value={record.role}
                onChange={(role) => handleRoleChange(record.id, role)}
                disabled={isSelf}
                size="small"
                style={{ width: 110 }}
                options={[
                  { label: t('users.roles.admin'), value: 'admin' },
                  { label: t('users.roles.auditor'), value: 'auditor' },
                ]}
              />
              <Popconfirm
                title={t('users.deleteConfirm')}
                onConfirm={() => handleDelete(record.id)}
                okText={t('common.yes')}
                cancelText={t('common.no')}
                disabled={isSelf}
              >
                <button
                  className="btn btn-danger btn-icon btn-sm"
                  disabled={isSelf}
                  title={t('common.delete')}
                >
                  <IconTrash size={13} />
                </button>
              </Popconfirm>
            </div>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('users.title')}</h1>
          <p className="page-subtitle">{t('users.subtitle')}</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table<User>
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={false}
        />
      </div>
    </div>
  );
}
