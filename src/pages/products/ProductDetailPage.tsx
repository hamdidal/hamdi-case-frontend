import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Form, Input, Select, DatePicker, Switch,
  Button, Drawer, Modal, InputNumber, Checkbox, Alert, App,
} from 'antd';
import dayjs from 'dayjs';
import { QRCodeSVG } from 'qrcode.react';
import {
  getProduct, updateProduct,
  getProductVersions, getProductVersion,
} from '@/api/products';
import { useAuthStore } from '@/store/useAuthStore';
import type { Product, Material, ProductVersion, ProductEditForm } from '@/types';
import { PRODUCT_CATEGORIES, WASH_OPTIONS, IRON_OPTIONS } from '@/utils/constants';
import {
  IconChevronRight, IconTrash, IconDownload,
  IconHistory, IconCopy,
} from '@/components/common/icons';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { capitalize } from '@/utils/formatters';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { message } = App.useApp();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [product, setProduct] = useState<Product | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<ProductVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<Partial<Product> | null>(null);
  const [snapshotTitle, setSnapshotTitle] = useState('');

  const [form] = Form.useForm<ProductEditForm>();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then((res) => {
        const p = res.data;
        setProduct(p);
        setMaterials(p.materials ?? []);
        form.setFieldsValue({
          name: p.name,
          brand: p.brand,
          category: p.category,
          country: p.country,
          productionDate: dayjs(p.productionDate),
          washTemperature: p.careInstructions?.washTemperature,
          ironing: p.careInstructions?.ironing,
          dryClean: p.careInstructions?.dryClean ?? false,
          bleaching: p.careInstructions?.bleaching ?? false,
          notes: p.careInstructions?.notes,
        });
      })
      .catch(() => setFetchError(t('common.error')))
      .finally(() => setLoading(false));
  }, [id, form, t]);

  const publicUrl = product
    ? `${import.meta.env.VITE_PUBLIC_BASE_URL as string}/p/${product.uuid}`
    : '';

  const handleSave = async () => {
    if (!id || !product) return;
    try {
      const values = await form.validateFields();
      setSaving(true);
      await updateProduct(id, {
        name: values.name,
        brand: values.brand,
        category: values.category,
        country: values.country,
        productionDate: values.productionDate.format('YYYY-MM-DD'),
        status: product.status,
        materials,
        careInstructions: {
          washTemperature: values.washTemperature,
          ironing: values.ironing,
          dryClean: values.dryClean ?? false,
          bleaching: values.bleaching ?? false,
          notes: values.notes,
        },
      });
      void message.success(t('products.updateSuccess'));
    } catch {
      void message.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handlePDFDownload = async () => {
    if (!product) return;
    const token = useAuthStore.getState().token;
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL as string}/products/${id}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passport-${product.uuid}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    if (!product) return;
    const publicUrl = `${import.meta.env.VITE_PUBLIC_BASE_URL as string}/p/${product.uuid}`;
    void navigator.clipboard.writeText(publicUrl);
    void message.success(t('common.copyLink'));
  };

  const handleOpenVersions = useCallback(async () => {
    if (!id) return;
    setVersionsOpen(true);
    setVersionsLoading(true);
    try {
      const res = await getProductVersions(id);
      setVersions(res.data);
    } catch {
      void message.error(t('common.error'));
    } finally {
      setVersionsLoading(false);
    }
  }, [id, message, t]);

  const handleVersionClick = async (v: ProductVersion) => {
    if (!id) return;
    try {
      const res = await getProductVersion(id, v.versionNumber);
      setSnapshot(res.data.snapshot);
      setSnapshotTitle(`v${v.versionNumber} — ${v.createdBy}`);
      setSnapshotOpen(true);
    } catch {
      void message.error(t('common.error'));
    }
  };

  const updateMaterial = (idx: number, updates: Partial<Material>) => {
    setMaterials((prev) => prev.map((m, i) => (i === idx ? { ...m, ...updates } : m)));
  };

  const addMaterial = () => {
    setMaterials((prev) => [...prev, { name: '', percentage: 0, recycled: false }]);
  };

  const removeMaterial = (idx: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalPct = materials.reduce((s, m) => s + (m.percentage || 0), 0);

  if (loading) {
    return (
      <div className="page">
        <div className="stat-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card-h" />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="page">
        <Alert type="error" title={fetchError ?? t('errors.notFound')} showIcon />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-left">
          <button
            className="btn btn-ghost btn-icon flex-none"
            onClick={() => navigate(-1)}
          >
            <IconChevronRight size={16} className="icon-flip-h" />
          </button>
          <div>
            <h1 className="page-title">{product.name}</h1>
            <p className="page-subtitle">{t('editor.title')}</p>
          </div>
        </div>
      </div>

      <div className="editor-grid">
        <Form form={form} layout="vertical" requiredMark={false} disabled={!isAdmin}>
          <div className="card">
            <div className="card-head">
              <span className="card-title">{t('editor.basicInfo')}</span>
            </div>
            <div className="card-body">
                <div className="editor-form-grid">
                  <Form.Item
                    name="name"
                    label={t('editor.fields.name')}
                    rules={[{ required: true, message: t('common.required') }]}
                    className="span-full"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="brand"
                    label={t('editor.fields.brand')}
                    rules={[{ required: true, message: t('common.required') }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="category"
                    label={t('editor.fields.category')}
                    rules={[{ required: true, message: t('common.required') }]}
                  >
                    <Select options={PRODUCT_CATEGORIES.map((c) => ({ label: capitalize(c), value: c }))} />
                  </Form.Item>

                  <Form.Item
                    name="country"
                    label={t('editor.fields.country')}
                    rules={[{ required: true, message: t('common.required') }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="productionDate"
                    label={t('editor.fields.date')}
                    rules={[{ required: true, message: t('common.required') }]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>
                </div>
            </div>
          </div>

          <div className="card card-mt">
            <div className="card-head">
              <span className="card-title">{t('editor.materials')}</span>
              <div className="card-head-actions">
                <div className={`total-chip ${totalPct === 100 ? 'ok' : 'bad'}`}>
                  {totalPct === 100
                    ? t('editor.material.totalOk')
                    : t('editor.material.totalBad', { value: totalPct })}
                </div>
              </div>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{t('editor.material.name')}</th>
                    <th className="col-w-120">{t('editor.material.percentage')}</th>
                    <th className="col-w-100">{t('editor.material.recycled')}</th>
                    {isAdmin && <th className="col-w-48" />}
                  </tr>
                </thead>
                <tbody>
                  {materials.map((mat, i) => (
                    <tr key={i}>
                      <td>
                        <Input
                          value={mat.name}
                          onChange={(e) => updateMaterial(i, { name: e.target.value })}
                          disabled={!isAdmin}
                          variant="borderless"
                          placeholder={t('editor.material.name')}
                        />
                      </td>
                      <td>
                        <InputNumber
                          min={0}
                          max={100}
                          value={mat.percentage}
                          onChange={(val) => updateMaterial(i, { percentage: val ?? 0 })}
                          disabled={!isAdmin}
                          variant="borderless"
                          className="w-full"
                          suffix="%"
                        />
                      </td>
                      <td>
                        <Checkbox
                          checked={mat.recycled}
                          onChange={(e) => updateMaterial(i, { recycled: e.target.checked })}
                          disabled={!isAdmin}
                        />
                      </td>
                      {isAdmin && (
                        <td>
                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() => removeMaterial(i)}
                          >
                            <IconTrash size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {materials.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 4 : 3} className="tbl-empty-cell">
                        {t('common.empty')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {isAdmin && (
              <div className="mat-add-row">
                <button className="btn btn-ghost btn-sm" onClick={addMaterial}>
                  + {t('editor.material.addRow')}
                </button>
              </div>
            )}
          </div>

          <div className="card card-mt">
            <div className="card-head">
              <span className="card-title">{t('editor.care')}</span>
            </div>
            <div className="card-body">
                <div className="editor-form-grid">
                  <Form.Item name="washTemperature" label={t('editor.careFields.wash')}>
                    <Select
                      allowClear
                      options={WASH_OPTIONS.map((v) => ({ label: v, value: v }))}
                    />
                  </Form.Item>

                  <Form.Item name="ironing" label={t('editor.careFields.iron')}>
                    <Select
                      allowClear
                      options={IRON_OPTIONS.map((v) => ({ label: v, value: v }))}
                    />
                  </Form.Item>

                  <Form.Item name="dryClean" label={t('editor.careFields.dryClean')} valuePropName="checked">
                    <Switch disabled={!isAdmin} />
                  </Form.Item>

                  <Form.Item name="bleaching" label={t('editor.careFields.bleach')} valuePropName="checked">
                    <Switch disabled={!isAdmin} />
                  </Form.Item>

                  <Form.Item
                    name="notes"
                    label={t('editor.careFields.notes')}
                    className="span-full"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder={t('editor.careFields.notesPlaceholder')}
                    />
                  </Form.Item>
                </div>
            </div>
          </div>

          {isAdmin && (
            <Button
              type="primary"
              block
              loading={saving}
              onClick={handleSave}
              className="mt-16"
            >
              {t('common.save')}
            </Button>
          )}
        </Form>

        <div className="sidebar-col">
          <div className="card">
            <div className="card-head">
              <span className="card-title">{t('editor.publicPassport')}</span>
            </div>
            <div className="card-body card-body-col">
              <div className="qr-center">
                <div className="qr-box">
                  {publicUrl ? (
                    <QRCodeSVG value={publicUrl} size={160} />
                  ) : (
                    <div className="skeleton skeleton-qr" />
                  )}
                </div>
              </div>
              <p className="qr-hint">{t('editor.qrHint')}</p>

              <button className="btn btn-full" onClick={handleCopyLink}>
                <IconCopy size={14} />
                {t('editor.copyLink')}
              </button>

              <button className="btn btn-full" onClick={handlePDFDownload}>
                <IconDownload size={14} />
                {t('editor.downloadPdf')}
              </button>

              <button className="btn btn-ghost btn-full" onClick={handleOpenVersions}>
                <IconHistory size={14} />
                {t('editor.versionHistory')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Drawer
        title={t('editor.versionHistory')}
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        width={480}
      >
        {versionsLoading ? (
          <div className="ver-loading">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-ver-item" />
            ))}
          </div>
        ) : versions.length === 0 ? (
          <p className="ver-empty">{t('common.empty')}</p>
        ) : (
          <div className="ver-list">
            {versions.map((v) => (
              <div
                key={v.versionNumber}
                className="ver-item"
                onClick={() => handleVersionClick(v)}
              >
                <div>
                  <div className="ver-title">
                    {t('editor.versionLabel', { number: v.versionNumber })}
                  </div>
                  <div className="ver-meta">
                    {t('editor.versionBy', { user: v.createdBy })} · {formatDateTime(v.createdAt)}
                  </div>
                </div>
                <IconChevronRight size={14} className="muted" />
              </div>
            ))}
          </div>
        )}
      </Drawer>

      <Modal
        open={snapshotOpen}
        onCancel={() => setSnapshotOpen(false)}
        footer={null}
        title={snapshotTitle}
        width={560}
      >
        {snapshot && (
          <div className="snap-body">
            {([
              ['editor.fields.name', snapshot.name],
              ['editor.fields.brand', snapshot.brand],
              ['editor.fields.category', snapshot.category ? capitalize(snapshot.category) : undefined],
              ['editor.fields.country', snapshot.country],
              ['editor.fields.date', snapshot.productionDate ? formatDate(snapshot.productionDate) : undefined],
            ] as [string, string | undefined][]).map(([key, val]) =>
              val ? (
                <div key={key} className="snap-row">
                  <span className="snap-key">{t(key)}</span>
                  <span className="snap-val">{val}</span>
                </div>
              ) : null
            )}
            {snapshot.materials && snapshot.materials.length > 0 && (
              <div>
                <div className="snap-mat-label">{t('editor.materials')}</div>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>{t('editor.material.name')}</th>
                      <th>{t('editor.material.percentage')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.materials.map((m, i) => (
                      <tr key={i}>
                        <td>{m.name}</td>
                        <td>{m.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
