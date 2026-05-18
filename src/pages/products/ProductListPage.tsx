import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Table, Input, Select, Button, Drawer, Form,
  DatePicker, App,
} from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
import { getProducts, createProduct, deleteProduct } from '@/api/products';
import { useConfirm } from '@/hooks/useConfirm';
import { useAuthStore } from '@/store/useAuthStore';
import type { Product, CreateProductForm } from '@/types';
import { PRODUCT_CATEGORIES } from '@/utils/constants';
import { IconEye, IconPencil, IconTrash, IconSearch } from '@/components/common/icons';
import { AppImage } from '@/components/common/AppImage';
import { formatDate } from '@/utils/formatDate';
import { capitalize } from '@/utils/formatters';
import { CountrySelect } from '@/components/common/CountrySelect';
import { CountryLabel } from '@/components/common/CountryLabel';
import { resolveCountryCode, codeToName } from '@/utils/countries';

export default function ProductListPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const navigate = useNavigate();
  const { message } = App.useApp();
  const showConfirm = useConfirm();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(20);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm<CreateProductForm>();

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProducts = async (pg: number, q: string, lim: number) => {
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
  };

  const fetchRef = useRef<typeof fetchProducts | undefined>(undefined);
  fetchRef.current = fetchProducts;

  useEffect(() => {
    fetchRef.current?.(page, search, pageSize);
  }, [page, pageSize, refreshKey]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      setRefreshKey((k) => k + 1);
    }, 300);
  };

  const handleTableChange = useCallback((pagination: TablePaginationConfig) => {
    const newSize = pagination.pageSize ?? pageSize;
    const newPage = newSize !== pageSize ? 1 : (pagination.current ?? 1);
    setPageSize(newSize);
    setPage(newPage);
  }, [pageSize]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteProduct(id);
      void message.success(t('products.deleteSuccess'));
      setRefreshKey((k) => k + 1);
    } catch {
      void message.error(t('common.error'));
    }
  }, [message, t]);

  const handleCreate = useCallback(async (values: CreateProductForm) => {
    try {
      await createProduct({
        name: values.name,
        brand: values.brand,
        category: values.category,
        country: codeToName(values.country, 'en') || values.country,
        productionDate: values.productionDate.format('YYYY-MM-DD'),
      });
      void message.success(t('products.createSuccess'));
      setDrawerOpen(false);
      form.resetFields();
      setPage(1);
      setRefreshKey((k) => k + 1);
    } catch {
      void message.error(t('common.error'));
    }
  }, [form, message, t]);

  const columns = useMemo<TableColumnsType<Product>>(() => [
    {
      title: t('products.columns.name'),
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <div className="tbl-name-cell">
          <AppImage variant="product" className="prod-swatch" alt={name} />
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: t('products.columns.brand'),
      dataIndex: 'brand',
      sorter: (a, b) => a.brand.localeCompare(b.brand),
      render: (v: string) => <span className="text-soft-cell">{v}</span>,
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
      render: (v: string) => {
        const code = resolveCountryCode(v, lang);
        return code
          ? <CountryLabel code={code} className="text-muted-cell" />
          : <span className="text-muted-cell">{v}</span>;
      },
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
        <div className="cell-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => navigate(`/products/${record.id}`, { state: { mode: 'view' } })}
            title={t('common.viewAll')}
          >
            <IconEye size={14} />
          </button>
          {isAdmin && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => navigate(`/products/${record.id}`, { state: { mode: 'edit' } })}
              title={t('common.edit')}
            >
              <IconPencil size={14} />
            </button>
          )}
          {isAdmin && (
            <button
              className="btn btn-danger btn-icon btn-sm"
              title={t('common.delete')}
              onClick={() => showConfirm({
                type: 'danger',
                title: t('common.confirmDeletion'),
                content: t('products.deleteConfirm'),
                okText: t('common.delete'),
                cancelText: t('common.cancel'),
                onConfirm: () => handleDelete(record.id),
              })}
            >
              <IconTrash size={14} />
            </button>
          )}
        </div>
      ),
    },
  ], [isAdmin, navigate, t, showConfirm, handleDelete]);

  return (
    <div className="page">
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

      <div className="filter-row">
        <div className="search-input search-half">
          <IconSearch size={14} />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
          />
        </div>
      </div>

      <div className="card card-flush">
        <Table<Product>
          rowKey="id"
          columns={columns}
          dataSource={products}
          loading={loading}
          scroll={{ x: 'max-content' }}
          onRow={(record) => ({ onClick: () => navigate(`/products/${record.id}`, { state: { mode: 'view' } }), style: { cursor: 'pointer' } })}
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
        />
      </div>

      <Drawer
        title={t('products.addNew')}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        size={480}
        footer={
          <div className="drawer-footer">
            <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>
              {t('common.cancel')}
            </Button>
            <Button
              type="primary"
              onClick={() =>
                void form.validateFields()
                  .then((values) =>
                    showConfirm({
                      title: t('common.confirmCreate'),
                      content: t('products.createConfirm'),
                      okText: t('common.save'),
                      cancelText: t('common.cancel'),
                      onConfirm: () => handleCreate(values),
                    })
                  )
                  .catch(() => {})
              }
            >
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label={t('editor.fields.name')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input placeholder={t('editor.fields.name')} />
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
            <CountrySelect />
          </Form.Item>

          <Form.Item
            name="productionDate"
            label={t('editor.fields.date')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
