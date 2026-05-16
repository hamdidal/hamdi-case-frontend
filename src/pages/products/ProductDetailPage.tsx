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
  const { user } = useAuthStore();
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
            <div key={i} className="skeleton" style={{ height: 112, borderRadius: 12 }} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => navigate(-1)}
            style={{ flexShrink: 0 }}
          >
            <IconChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div>
            <h1 className="page-title">{product.name}</h1>
            <p className="page-subtitle">{t('editor.title')}</p>
          </div>
        </div>
      </div>

      <div className="editor-grid">
        <div>
          <div className="card">
            <div className="card-head">
              <span className="card-title">{t('editor.basicInfo')}</span>
            </div>
            <div className="card-body">
              <Form form={form} layout="vertical" requiredMark={false} disabled={!isAdmin}>
                <div className="editor-form-grid">
                  <Form.Item
                    name="name"
                    label={t('editor.fields.name')}
                    rules={[{ required: true, message: t('common.required') }]}
                    style={{ gridColumn: '1 / -1' }}
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
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-head">
              <span className="card-title">{t('editor.materials')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                    <th style={{ width: 120 }}>{t('editor.material.percentage')}</th>
                    <th style={{ width: 100 }}>{t('editor.material.recycled')}</th>
                    {isAdmin && <th style={{ width: 48 }} />}
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
                          style={{ width: '100%' }}
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
                      <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                        {t('common.empty')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {isAdmin && (
              <div style={{ padding: '12px 16px' }}>
                <button className="btn btn-ghost btn-sm" onClick={addMaterial}>
                  + {t('editor.material.addRow')}
                </button>
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-head">
              <span className="card-title">{t('editor.care')}</span>
            </div>
            <div className="card-body">
              <Form form={form} layout="vertical" requiredMark={false} disabled={!isAdmin}>
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
                    style={{ gridColumn: '1 / -1' }}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder={t('editor.careFields.notesPlaceholder')}
                    />
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>

          {isAdmin && (
            <Button
              type="primary"
              block
              loading={saving}
              onClick={handleSave}
              style={{ marginTop: 16 }}
            >
              {t('common.save')}
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-head">
              <span className="card-title">{t('editor.publicPassport')}</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  background: '#fff',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  lineHeight: 0,
                }}>
                  {publicUrl ? (
                    <QRCodeSVG value={publicUrl} size={160} />
                  ) : (
                    <div className="skeleton" style={{ width: 160, height: 160 }} />
                  )}
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                {t('editor.qrHint')}
              </p>

              <button className="btn" style={{ width: '100%', justifyContent: 'center', gap: 8 }} onClick={handleCopyLink}>
                <IconCopy size={14} />
                {t('editor.copyLink')}
              </button>

              <button className="btn" style={{ width: '100%', justifyContent: 'center', gap: 8 }} onClick={handlePDFDownload}>
                <IconDownload size={14} />
                {t('editor.downloadPdf')}
              </button>

              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 8 }} onClick={handleOpenVersions}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
            ))}
          </div>
        ) : versions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>{t('common.empty')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {versions.map((v) => (
              <div
                key={v.versionNumber}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: 'var(--bg-surface)',
                }}
                onClick={() => handleVersionClick(v)}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {t('editor.versionLabel', { number: v.versionNumber })}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {t('editor.versionBy', { user: v.createdBy })} · {formatDateTime(v.createdAt)}
                  </div>
                </div>
                <IconChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {([
              ['editor.fields.name', snapshot.name],
              ['editor.fields.brand', snapshot.brand],
              ['editor.fields.category', snapshot.category ? capitalize(snapshot.category) : undefined],
              ['editor.fields.country', snapshot.country],
              ['editor.fields.date', snapshot.productionDate ? formatDate(snapshot.productionDate) : undefined],
            ] as [string, string | undefined][]).map(([key, val]) =>
              val ? (
                <div key={key} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 130 }}>{t(key)}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{val}</span>
                </div>
              ) : null
            )}
            {snapshot.materials && snapshot.materials.length > 0 && (
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 }}>{t('editor.materials')}</div>
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
