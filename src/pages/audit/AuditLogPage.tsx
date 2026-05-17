import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Select, Input, Button, DatePicker, App } from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
import type { Dayjs } from 'dayjs';
import { getAuditLogs } from '@/api/auditLogs';
import type { AuditLog, AuditAction, AuditLogFilters, AuditChanges } from '@/types';
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

function renderVal(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function DiffViewer({ changes }: { changes: AuditChanges | undefined }) {
  const { t } = useTranslation();
  if (!changes || Object.keys(changes).length === 0) {
    return <span className="muted fs-13">{t('audit.noChanges')}</span>;
  }

  if ('before' in changes || 'after' in changes) {
    const before = changes.before as Record<string, unknown> | undefined;
    const after = changes.after as Record<string, unknown> | undefined;
    const allKeys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]));
    const diffKeys = allKeys.filter((key) => before?.[key] !== after?.[key]);

    if (diffKeys.length === 0) {
      return <span className="muted fs-13">{t('audit.noChanges')}</span>;
    }

    return (
      <div className="diff">
        {diffKeys.map((key) => {
          const bVal = before?.[key];
          const aVal = after?.[key];
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

  const fetchLogs = useCallback(async (pg: number, filters: AuditLogFilters, lim: number) => {
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

  const buildFilters = (): AuditLogFilters => ({
    action: filterAction,
    username: filterUsername || undefined,
    dateFrom: filterRange?.[0]?.toISOString(),
    dateTo: filterRange?.[1]?.toISOString(),
  });

  useEffect(() => {
    void fetchLogs(page, buildFilters(), pageSize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    void fetchLogs(1, buildFilters(), pageSize);
  };

  const handleClear = () => {
    setFilterAction(undefined);
    setFilterUsername('');
    setFilterRange(null);
    setPage(1);
    void fetchLogs(1, {}, pageSize);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const newSize = pagination.pageSize ?? pageSize;
    const newPage = newSize !== pageSize ? 1 : (pagination.current ?? 1);
    setPageSize(newSize);
    setPage(newPage);
  };

  const columns: TableColumnsType<AuditLog> = [
    {
      title: t('audit.columns.time'),
      dataIndex: 'timestamp',
      width: 180,
      render: (v: string) => (
        <span className="time-mono">{formatDateTime(v)}</span>
      ),
    },
    {
      title: t('audit.columns.user'),
      dataIndex: 'username',
      render: (v: string) => (
        <div className="audit-user-cell">
          <div className="user-avatar user-avatar-sm">
            {v[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="fw-500">{v}</span>
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
        <span className="text-soft-cell">{v ?? '—'}</span>
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

      <div className="filter-bar">
        <Select<AuditAction>
          allowClear
          placeholder={t('audit.allActions')}
          value={filterAction}
          onChange={(v) => setFilterAction(v)}
          className="filter-bar-select"
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
          className="filter-bar-input"
          allowClear
        />
        <RangePicker
          value={filterRange}
          onChange={(v) => setFilterRange(v as RangeValue)}
          className="filter-bar-picker"
        />
        <Button type="primary" onClick={handleSearch} className="filter-bar-btn">{t('common.filter')}</Button>
        <Button onClick={handleClear} className="filter-bar-btn">{t('common.cancel')}</Button>
      </div>

      <div className="card card-flush">
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
