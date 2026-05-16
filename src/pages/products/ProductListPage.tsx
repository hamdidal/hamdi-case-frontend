import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Table, Input, Select, Button, Drawer, Form,
  DatePicker, Modal, App,
} from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getProducts, createProduct, deleteProduct } from '@/api/products';
import { useAuthStore } from '@/store/useAuthStore';
import type { Product, CreateProductForm } from '@/types';
import { PRODUCT_CATEGORIES } from '@/utils/constants';
import { IconEye, IconPencil, IconTrash, IconSearch } from '@/components/common/icons';
import { formatDate } from '@/utils/formatDate';
import { capitalize } from '@/utils/formatters';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProductListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(20);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm<CreateProductForm>();

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // lim is always explicit — no default — to avoid stale-closure bugs with useCallback
  const fetchProducts = useCallback(async (pg: number, q: string, lim: number) => {
    setLoading(true);
    try {
      const res = await getProducts({ page: pg, limit: lim, search: q || undefined });
      setProducts(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      void message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [message, t]);

  // Re-runs on page OR pageSize change; always passes current pageSize explicitly
  useEffect(() => {
    void fetchProducts(page, search, pageSize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProducts, page, pageSize]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      void fetchProducts(1, val, pageSize);
    }, 300);
  };

  // Pure state update — useEffect drives the fetch; batched updates = one fetch
  const handleTableChange = (pagination: TablePaginationConfig) => {
    const newSize = pagination.pageSize ?? pageSize;
    // Reset to page 1 whenever page size changes
    const newPage = newSize !== pageSize ? 1 : (pagination.current ?? 1);
    setPageSize(newSize);
    setPage(newPage);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      void message.success(t('products.deleteSuccess'));
      void fetchProducts(page, search, pageSize);
    } catch {
      void message.error(t('common.error'));
    }
  };

  const handleCreate = async (values: CreateProductForm) => {
    setCreating(true);
    try {
      await createProduct({
        name: values.name,
        brand: values.brand,
        category: values.category,
        country: values.country,
        productionDate: values.productionDate.format('YYYY-MM-DD'),
      });
      void message.success(t('products.createSuccess'));
      setDrawerOpen(false);
      form.resetFields();
      setPage(1);
      void fetchProducts(1, search, pageSize);
    } catch {
      void message.error(t('common.error'));
    } finally {
      setCreating(false);
    }
  };

  const columns: TableColumnsType<Product> = [
    {
      title: t('products.columns.name'),
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="prod-swatch" />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </div>
      ),
    },
    {
      title: t('products.columns.brand'),
      dataIndex: 'brand',
      sorter: (a, b) => a.brand.localeCompare(b.brand),
      render: (v: string) => <span style={{ color: 'var(--text-soft)' }}>{v}</span>,
    },
    {
      title: t('products.columns.category'),
      dataIndex: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category),
      render: (v: string) => <span className="tag brand">{capitalize(v)}</span>,
    },
    {
      title: t('products.columns.country'),
      dataIndex: 'country',
      render: (v: string) => <span style={{ color: 'var(--text-muted)' }}>{v}</span>,
    },
    {
      title: t('products.columns.date'),
      dataIndex: 'productionDate',
      sorter: (a, b) => a.productionDate.localeCompare(b.productionDate),
      render: (v: string) => formatDate(v),
    },
    {
      title: t('products.columns.status'),
      dataIndex: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (v: string) => (
        <span className={`tag ${v === 'published' ? 'success' : ''}`}>
          {t(`products.status.${v}`)}
        </span>
      ),
    },
    {
      title: t('products.columns.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => navigate(`/products/${record.id}`)}
            title={t('common.viewAll')}
          >
            <IconEye size={14} />
          </button>
          {isAdmin && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => navigate(`/products/${record.id}`)}
              title={t('common.edit')}
            >
              <IconPencil size={14} />
            </button>
          )}
          {isAdmin && (
            <button
              className="btn btn-danger btn-icon btn-sm"
              title={t('common.delete')}
              onClick={() => setDeleteId(record.id)}
            >
              <IconTrash size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('products.title')}</h1>
          <p className="page-subtitle">{t('products.subtitle')}</p>
        </div>
        {isAdmin && (
          <Button type="primary" onClick={() => setDrawerOpen(true)}>
            {t('products.addNew')}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="search-input" style={{ width: '50%' }}>
          <IconSearch size={14} className="search-icon" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table<Product>
          rowKey="id"
          columns={columns}
          dataSource={products}
          loading={loading}
          scroll={{ x: 'max-content' }}
          onRow={(record) => ({ onClick: () => navigate(`/products/${record.id}`) })}
          rowClassName={() => 'tbl-row-clickable'}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 50, 100],
            showTotal: (n) => `${n} ${t('products.title').toLowerCase()}`,
          }}
          onChange={handleTableChange}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Delete Confirmation Modal */}
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

      {/* Add Product Drawer */}
      <Drawer
        title={t('products.addNew')}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        width={480}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>
              {t('common.cancel')}
            </Button>
            <Button type="primary" loading={creating} onClick={() => form.submit()}>
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label={t('editor.fields.name')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input
              prefix={<UserOutlined style={{ opacity: 0 }} />}
              placeholder={t('editor.fields.name')}
            />
          </Form.Item>

          <Form.Item
            name="brand"
            label={t('editor.fields.brand')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input placeholder={t('editor.fields.brand')} />
          </Form.Item>

          <Form.Item
            name="category"
            label={t('editor.fields.category')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select
              placeholder={t('editor.fields.category')}
              options={PRODUCT_CATEGORIES.map((c) => ({ label: capitalize(c), value: c }))}
            />
          </Form.Item>

          <Form.Item
            name="country"
            label={t('editor.fields.country')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input placeholder={t('editor.fields.country')} />
          </Form.Item>

          <Form.Item
            name="productionDate"
            label={t('editor.fields.date')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
