import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Table, Input, Select, Button, Drawer, Form,
  DatePicker, Popconfirm, App,
} from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
import type { Dayjs } from 'dayjs';
import { UserOutlined } from '@ant-design/icons';
import { getProducts, createProduct, deleteProduct } from '@/api/products';
import { useAuthStore } from '@/store/useAuthStore';
import type { Product } from '@/types';
import { IconEye, IconPencil, IconTrash, IconSearch } from '@/components/common/icons';
import { formatDate } from '@/utils/formatDate';

const CATEGORIES = ['t-shirt', 'pantolon', 'ceket', 'ic-giyim', 'diger'] as const;

interface CreateForm {
  name: string;
  brand: string;
  category: string;
  country: string;
  productionDate: Dayjs;
}

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
  const [category, setCategory] = useState<string | undefined>();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm<CreateForm>();

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(async (pg: number, q: string, cat?: string) => {
    setLoading(true);
    try {
      const res = await getProducts({ page: pg, limit: 20, search: q || undefined, category: cat });
      setProducts(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      void message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [message, t]);

  useEffect(() => {
    void fetchProducts(page, search, category);
  }, [fetchProducts, page, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      void fetchProducts(1, val, category);
    }, 300);
  };

  const handleCategoryChange = (val: string | undefined) => {
    setCategory(val);
    setPage(1);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      void message.success(t('products.deleteSuccess'));
      void fetchProducts(page, search, category);
    } catch {
      void message.error(t('common.error'));
    }
  };

  const handleCreate = async (values: CreateForm) => {
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
      void fetchProducts(1, search, category);
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
      render: (v: string) => <span style={{ color: 'var(--text-soft)' }}>{v}</span>,
    },
    {
      title: t('products.columns.category'),
      dataIndex: 'category',
      render: (v: string) => <span className="tag brand">{v}</span>,
    },
    {
      title: t('products.columns.country'),
      dataIndex: 'country',
      render: (v: string) => <span style={{ color: 'var(--text-muted)' }}>{v}</span>,
    },
    {
      title: t('products.columns.date'),
      dataIndex: 'productionDate',
      render: (v: string) => formatDate(v),
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
            <Popconfirm
              title={t('products.deleteConfirm')}
              onConfirm={() => handleDelete(record.id)}
              okText={t('common.yes')}
              cancelText={t('common.no')}
            >
              <button
                className="btn btn-danger btn-icon btn-sm"
                title={t('common.delete')}
              >
                <IconTrash size={14} />
              </button>
            </Popconfirm>
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
        <div className="search-input" style={{ flex: '1 1 280px', maxWidth: 360 }}>
          <IconSearch size={14} className="search-icon" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
          />
        </div>
        <Select
          allowClear
          placeholder={t('products.allCategories')}
          style={{ width: 180 }}
          value={category}
          onChange={handleCategoryChange}
          options={CATEGORIES.map((c) => ({ label: c, value: c }))}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table<Product>
          rowKey="id"
          columns={columns}
          dataSource={products}
          loading={loading}
          onRow={(record) => ({ onClick: () => navigate(`/products/${record.id}`) })}
          rowClassName={() => 'tbl-row-clickable'}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            showSizeChanger: false,
            showTotal: (n) => `${n} ${t('products.title').toLowerCase()}`,
          }}
          onChange={handleTableChange}
          style={{ cursor: 'pointer' }}
        />
      </div>

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
              options={CATEGORIES.map((c) => ({ label: c, value: c }))}
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
