import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Select, Modal, Tooltip, App } from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = (pg = page, lim = pageSize) => {
    setLoading(true);
    getUsers({ page: pg, limit: lim })
      .then((res) => {
        setUsers(res.data.data ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch(() => void message.error(t('common.error')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(page, pageSize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const newPage = pagination.current ?? 1;
    const newSize = pagination.pageSize ?? pageSize;
    setPage(newPage);
    setPageSize(newSize);
  };

  const handleRoleChange = async (id: string, role: Role) => {
    try {
      await updateUserRole(id, role);
      void message.success(t('users.updateSuccess'));
      fetchUsers(page, pageSize);
    } catch {
      void message.error(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      void message.success(t('users.deleteSuccess'));
      fetchUsers(page, pageSize);
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
        <div className="user-avatar user-avatar-md">
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
        const isSelf = String(record.id) === String(currentUser?.id);
        return (
          <Tooltip title={isSelf ? t('users.cannotDeleteSelf') : undefined}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Select<Role>
                value={record.role}
                onChange={(role) => handleRoleChange(String(record.id), role)}
                disabled={isSelf}
                size="small"
                style={{ width: 110 }}
                options={[
                  { label: t('users.roles.admin'), value: 'admin' },
                  { label: t('users.roles.auditor'), value: 'auditor' },
                ]}
              />
              <button
                className="btn btn-danger btn-icon btn-sm"
                disabled={isSelf}
                title={t('common.delete')}
                onClick={() => !isSelf && setDeleteId(String(record.id))}
              >
                <IconTrash size={13} />
              </button>
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

      <Modal
        open={deleteId !== null}
        title={t('common.confirmDeletion')}
        okText={t('common.delete')}
        okButtonProps={{ danger: true }}
        cancelText={t('common.cancel')}
        onOk={async () => { if (deleteId !== null) { await handleDelete(deleteId); } setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      >
        <p>{t('common.deleteWarning')}</p>
      </Modal>
    </div>
  );
}
