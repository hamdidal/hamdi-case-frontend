import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Select, Tooltip, App } from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
import { getUsers, updateUserRole, deleteUser } from '@/api/users';
import { useConfirm } from '@/hooks/useConfirm';
import { useAuthStore } from '@/store/useAuthStore';
import { RoleBadge } from '@/components/common/RoleBadge';
import { IconTrash } from '@/components/common/icons';
import { AppImage } from '@/components/common/AppImage';
import type { User, Role } from '@/types';
import { formatDate } from '@/utils/formatDate';

export default function UsersPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const showConfirm = useConfirm();
  const currentUser = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const fetchUsers = useCallback((pg: number, lim: number) => {
    setLoading(true);
    getUsers({ page: pg, limit: lim })
      .then((res) => {
        setUsers(res.data.data ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch(() => void message.error(t('common.error')))
      .finally(() => setLoading(false));
  }, [message, t]);

  useEffect(() => {
    fetchUsers(page, pageSize);
  }, [fetchUsers, page, pageSize]);

  const handleTableChange = useCallback((pagination: TablePaginationConfig) => {
    const newSize = pagination.pageSize ?? pageSize;
    const newPage = newSize !== pageSize ? 1 : (pagination.current ?? 1);
    setPage(newPage);
    setPageSize(newSize);
  }, [pageSize]);

  const handleRoleChange = useCallback(async (id: string, role: Role) => {
    try {
      await updateUserRole(id, role);
      void message.success(t('users.updateSuccess'));
      fetchUsers(page, pageSize);
    } catch {
      void message.error(t('common.error'));
    }
  }, [fetchUsers, page, pageSize, message, t]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteUser(id);
      void message.success(t('users.deleteSuccess'));
      fetchUsers(page, pageSize);
    } catch {
      void message.error(t('common.error'));
    }
  }, [fetchUsers, page, pageSize, message, t]);

  const columns = useMemo<TableColumnsType<User>>(() => [
    {
      title: '',
      key: 'avatar',
      width: 52,
      render: (_, record) => (
        <AppImage variant="user" className="user-avatar user-avatar-md" alt={record.username} />
      ),
    },
    {
      title: t('users.columns.username'),
      dataIndex: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
      render: (v: string) => <span className="fw-500">{v}</span>,
    },
    {
      title: t('users.columns.role'),
      dataIndex: 'role',
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (_, record) => <RoleBadge role={record.role} />,
    },
    {
      title: t('users.columns.createdAt'),
      dataIndex: 'createdAt',
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (v: string) => <span className="text-soft-cell">{formatDate(v)}</span>,
    },
    {
      title: t('users.columns.actions'),
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const isSelf = String(record.id) === String(currentUser?.id);
        return (
          <Tooltip title={isSelf ? t('users.cannotDeleteSelf') : undefined}>
            <div className="user-action-cell">
              <Select<Role>
                value={record.role}
                onChange={(role) => showConfirm({
                  type: 'warning',
                  title: t('users.roleChangeTitle'),
                  content: t('users.roleChangeConfirm'),
                  okText: t('common.confirm'),
                  cancelText: t('common.cancel'),
                  onConfirm: () => handleRoleChange(String(record.id), role),
                })}
                disabled={isSelf}
                size="small"
                className="role-select"
                options={[
                  { label: t('users.roles.admin'), value: 'admin' },
                  { label: t('users.roles.auditor'), value: 'auditor' },
                ]}
              />
              <button
                className="btn btn-danger btn-icon btn-sm"
                disabled={isSelf}
                title={t('common.delete')}
                onClick={() => !isSelf && showConfirm({
                  type: 'danger',
                  title: t('common.confirmDeletion'),
                  content: t('users.deleteConfirm'),
                  okText: t('common.delete'),
                  cancelText: t('common.cancel'),
                  onConfirm: () => handleDelete(String(record.id)),
                })}
              >
                <IconTrash size={13} />
              </button>
            </div>
          </Tooltip>
        );
      },
    },
  ], [currentUser, t, handleRoleChange, handleDelete, showConfirm]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('users.title')}</h1>
          <p className="page-subtitle">{t('users.subtitle')}</p>
        </div>
      </div>

      <div className="card card-flush">
        <Table<User>
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 50, 100],
            showTotal: (n) => `${n} ${t('users.title').toLowerCase()}`,
          }}
          onChange={handleTableChange}
        />
      </div>

    </div>
  );
}
