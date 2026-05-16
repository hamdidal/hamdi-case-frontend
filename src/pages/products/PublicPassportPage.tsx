import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ConfigProvider } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import { getPublicPassport } from '@/api/products';
import type { Product } from '@/types';
import { lightTheme } from '@/theme';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import {
  IconGlobe, IconRecycle, IconWash, IconIron, IconDry, IconBleach,
} from '@/components/common/icons';
import { formatDate } from '@/utils/formatDate';
import { capitalize } from '@/utils/formatters';

const PUBLIC_BASE = import.meta.env.VITE_PUBLIC_BASE_URL as string;

// ── Sub-components ────────────────────────────────────────────────────────────

function CareItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ color: 'var(--text-muted)', marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text)' }}>{value}</div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PublicPassportPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!uuid) { setNotFound(true); setLoading(false); return; }
    getPublicPassport(uuid)
      .then((res) => setProduct(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [uuid]);

  const publicUrl = uuid ? `${PUBLIC_BASE}/p/${uuid}` : '';

  const care = product?.careInstructions;

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: 'var(--bg-app)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 12 }}>404</div>
          <h2 style={{ color: 'var(--text)' }}>{t('public.notFound')}</h2>
          <a href="/" style={{ color: 'var(--brand-600)', textDecoration: 'none', fontSize: 14 }}>
            {t('errors.goHome')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider theme={lightTheme}>
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)', fontFamily: 'var(--font-ui)' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #52B788 0%, #2D6A4F 100%)',
              flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Kobe</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>DPP</div>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Max-width container */}
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {/* Hero */}
          <div style={{ padding: '40px 32px 32px', borderBottom: '1px solid var(--border)' }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)', margin: '0 0 12px' }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="tag brand">{product.brand}</span>
              <span className="tag">{capitalize(product.category)}</span>
            </div>
          </div>

          {/* Info grid */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <IconGlobe size={16} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                    {t('public.country')}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text)' }}>{product.country}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                  {t('public.date')}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text)' }}>{formatDate(product.productionDate)}</div>
              </div>
            </div>
          </div>

          {/* Materials */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
            <SectionHeading>{t('public.materials')}</SectionHeading>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{t('editor.material.name')}</th>
                    <th style={{ width: 120 }}>{t('editor.material.percentage')}</th>
                    <th style={{ width: 100 }}>{t('editor.material.recycled')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(product.materials ?? []).map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.percentage}%</td>
                      <td>
                        {m.recycled ? (
                          <IconRecycle size={14} style={{ color: 'var(--semantic-success)' }} />
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Care Instructions */}
          {care && (
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
              <SectionHeading>{t('public.care')}</SectionHeading>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
                {care.washTemperature && (
                  <CareItem
                    icon={<IconWash size={15} />}
                    label={t('editor.careFields.wash')}
                    value={care.washTemperature}
                  />
                )}
                {care.ironing && (
                  <CareItem
                    icon={<IconIron size={15} />}
                    label={t('editor.careFields.iron')}
                    value={care.ironing}
                  />
                )}
                <CareItem
                  icon={<IconDry size={15} />}
                  label={t('editor.careFields.dryClean')}
                  value={care.dryClean ? t('common.yes') : t('common.no')}
                />
                <CareItem
                  icon={<IconBleach size={15} />}
                  label={t('editor.careFields.bleach')}
                  value={care.bleaching ? t('common.yes') : t('common.no')}
                />
                {care.notes && (
                  <div style={{ gridColumn: '1 / -1', color: 'var(--text-soft)', fontSize: 13 }}>
                    {care.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QR Code */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{
                background: '#fff',
                padding: 16,
                borderRadius: 12,
                border: '1px solid var(--border)',
                lineHeight: 0,
              }}>
                <QRCodeSVG value={publicUrl} size={180} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, maxWidth: 300 }}>
                {t('public.qrTitle')}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '20px 32px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              {t('public.poweredBy')}
            </p>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
