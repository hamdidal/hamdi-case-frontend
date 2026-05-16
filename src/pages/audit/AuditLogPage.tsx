import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Select, Input, Button, DatePicker, App } from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
import type { Dayjs } from 'dayjs';
import { getAuditLogs } from '@/api/auditLogs';
import type { AuditLog, AuditAction, AuditLogFilters } from '@/types';
import { formatDateTime } from '@/utils/formatDate';

const { RangePicker } = DatePicker;

type RangeValue = [Dayjs | null, Dayjs | null] | null;

const ACTION_TAG: Record<AuditAction, string> = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  login: '',
};

const PAGE_SIZE = 20;

// ── Diff viewer ───────────────────────────────────────────────────────────────

function DiffViewer({ changes }: { changes: Record<string, [unknown, unknown]> | undefined }) {
  const { t } = useTranslation();
  if (!changes || Object.keys(changes).length === 0) {
    return <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('audit.noChanges')}</span>;
  }
  return (
    <div className="diff">
      {Object.entries(changes).map(([field, [before, after]]) => (
        <div className="diff-line" key={field}>
          <span className="diff-key">{field}</span>
          {before !== undefined && before !== null && (
            <span className="diff-old">{String(before)}</span>
          )}
          {before !== undefined && before !== null && after !== undefined && after !== null && (
            <span className="diff-arr">→</span>
          )}
          {after !== undefined && after !== null && (
            <span className="diff-new">{String(after)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [filterAction, setFilterAction] = useState<AuditAction | undefined>();
  const [filterUsername, setFilterUsername] = useState('');
  const [filterRange, setFilterRange] = useState<RangeValue>(null);

  const fetchLogs = useCallback(async (pg: number, filters: AuditLogFilters) => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        ...filters,
        limit: PAGE_SIZE,
        offset: (pg - 1) * PAGE_SIZE,
      });
      setLogs(res.data.data);
      setTotal(res.data.total);
    } catch {
      void message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [message, t]);

  useEffect(() => {
    void fetchLogs(page, buildFilters());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const buildFilters = (): AuditLogFilters => ({
    action: filterAction,
    username: filterUsername || undefined,
    dateFrom: filterRange?.[0]?.toISOString(),
    dateTo: filterRange?.[1]?.toISOString(),
  });

  const handleSearch = () => {
    setPage(1);
    void fetchLogs(1, buildFilters());
  };

  const handleClear = () => {
    setFilterAction(undefined);
    setFilterUsername('');
    setFilterRange(null);
    setPage(1);
    void fetchLogs(1, {});
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
  };

  const columns: TableColumnsType<AuditLog> = [
    {
      title: t('audit.columns.time'),
      dataIndex: 'timestamp',
      width: 180,
      render: (v: string) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{formatDateTime(v)}</span>
      ),
    },
    {
      title: t('audit.columns.user'),
      dataIndex: 'username',
      render: (v: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'var(--brand-500)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {v[0]?.toUpperCase() ?? 'U'}
          </div>
          <span style={{ fontWeight: 500 }}>{v}</span>
        </div>
      ),
    },
    {
      title: t('audit.columns.action'),
      dataIndex: 'action',
      width: 120,
      render: (v: AuditAction) => (
        <span className={`tag ${ACTION_TAG[v] ?? ''}`}>
          {t(`audit.actions.${v}`)}
        </span>
      ),
    },
    {
      title: t('audit.columns.entity'),
      dataIndex: 'entityName',
      render: (v: string | undefined) => (
        <span style={{ color: 'var(--text-soft)' }}>{v ?? '—'}</span>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('audit.title')}</h1>
          <p className="page-subtitle">{t('audit.subtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select<AuditAction>
          allowClear
          placeholder={t('audit.allActions')}
          value={filterAction}
          onChange={(v) => setFilterAction(v)}
          style={{ width: 160 }}
          options={[
            { label: t('audit.actions.create'), value: 'create' },
            { label: t('audit.actions.update'), value: 'update' },
            { label: t('audit.actions.delete'), value: 'delete' },
            { label: t('audit.actions.login'),  value: 'login'  },
          ]}
        />
        <Input
          placeholder={t('audit.filterByUser')}
          value={filterUsername}
          onChange={(e) => setFilterUsername(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <RangePicker
          value={filterRange}
          onChange={(v) => setFilterRange(v as RangeValue)}
          style={{ width: 280 }}
        />
        <Button type="primary" onClick={handleSearch}>{t('common.filter')}</Button>
        <Button onClick={handleClear}>{t('common.cancel')}</Button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table<AuditLog>
          rowKey="id"
          columns={columns}
          dataSource={logs}
          loading={loading}
          expandable={{
            expandedRowRender: (record) => <DiffViewer changes={record.changes} />,
            rowExpandable: (record) =>
              record.action !== 'login' &&
              !!record.changes &&
              Object.keys(record.changes).length > 0,
          }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            showTotal: (n) => `${n} ${t('audit.title').toLowerCase()}`,
          }}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
}
