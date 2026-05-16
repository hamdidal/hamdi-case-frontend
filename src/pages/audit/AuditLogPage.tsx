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

const DEFAULT_PAGE_SIZE = 20;

// ── Diff viewer ───────────────────────────────────────────────────────────────

function renderVal(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function DiffViewer({ changes }: { changes: Record<string, unknown> | undefined }) {
  const { t } = useTranslation();
  if (!changes || Object.keys(changes).length === 0) {
    return <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('audit.noChanges')}</span>;
  }

  // before/after structure (update / delete operations)
  if ('before' in changes || 'after' in changes) {
    const before = changes.before as Record<string, unknown> | undefined;
    const after = changes.after as Record<string, unknown> | undefined;
    const keys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]));
    return (
      <div className="diff">
        {keys.map((key) => {
          const bVal = before?.[key];
          const aVal = after?.[key];
          if (bVal === aVal) return null;
          return (
            <div className="diff-line" key={key}>
              <span className="diff-key">{key}</span>
              {bVal !== undefined && <span className="diff-old">{renderVal(bVal)}</span>}
              {bVal !== undefined && aVal !== undefined && <span className="diff-arr">→</span>}
              {aVal !== undefined && <span className="diff-new">{renderVal(aVal)}</span>}
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback: flat key → value pairs (e.g. seeded audit entries)
  return (
    <div className="diff">
      {Object.entries(changes).map(([field, val]) => (
        <div className="diff-line" key={field}>
          <span className="diff-key">{field}</span>
          <span className="diff-new">{renderVal(val)}</span>
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
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const [filterAction, setFilterAction] = useState<AuditAction | undefined>();
  const [filterUsername, setFilterUsername] = useState('');
  const [filterRange, setFilterRange] = useState<RangeValue>(null);

  const fetchLogs = useCallback(async (pg: number, filters: AuditLogFilters, lim = pageSize) => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        ...filters,
        limit: lim,
        offset: (pg - 1) * lim,
      });
      setLogs(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
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
    const newPage = pagination.current ?? 1;
    const newSize = pagination.pageSize ?? pageSize;
    if (newSize !== pageSize) {
      setPageSize(newSize);
      setPage(1);
      void fetchLogs(1, buildFilters(), newSize);
    } else {
      setPage(newPage);
    }
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
          <div className="user-avatar user-avatar-sm">
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
      <div className="filter-bar">
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
          scroll={{ x: 'max-content' }}
          expandable={{
            expandedRowRender: (record) => <DiffViewer changes={record.changes} />,
            rowExpandable: (record) =>
              record.action !== 'login' &&
              !!record.changes &&
              Object.keys(record.changes).length > 0,
          }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 50, 100],
            showTotal: (n) => `${n} ${t('audit.title').toLowerCase()}`,
          }}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
}
