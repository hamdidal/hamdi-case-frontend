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
import { AppImage } from '@/components/common/AppImage';
import { CountryLabel } from '@/components/common/CountryLabel';
import { resolveCountryCode } from '@/utils/countries';

const PUBLIC_BASE = import.meta.env.VITE_PUBLIC_BASE_URL as string;

function CareItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="pub-care-item">
      <span className="pub-care-icon">{icon}</span>
      <div>
        <div className="pub-care-lbl">{label}</div>
        <div className="pub-care-val">{value}</div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <div className="section-heading">{children}</div>;
}

export default function PublicPassportPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('tr') ? 'tr' : 'en';

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
      <div className="pub-loading">
        <div className="pub-loading-inner">
          <div className="skeleton skeleton-loading" />
          <div className="pub-loading-text">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="pub-404">
        <div>
          <div className="pub-404-code">404</div>
          <h2 className="pub-404-title">{t('public.notFound')}</h2>
          <a href="/" className="pub-404-link">{t('errors.goHome')}</a>
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider theme={lightTheme}>
      <div className="pub-shell">
        <div className="pub-header">
          <div className="pub-brand-block">
          <AppImage variant="app-icon" height={30} width={30} alt="Kobe DPP" />
            <div>
              <div className="pub-brand-name">Kobe</div>
              <div className="pub-brand-label">DPP</div>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="pub-content">
          <div className="pub-hero">
            <div className="pub-hero-img-wrap">
              <AppImage variant="product" alt={product.name} className="pub-hero-img" />
            </div>
            <div className="pub-qr-wrap pub-qr-wrap--hero">
              <div className="pub-qr-inner">
                <div className="pub-qr-box">
                  <QRCodeSVG value={publicUrl} size={120} />
                </div>
                <p className="pub-qr-hint">{t('public.qrTitle')}</p>
              </div>
            </div>
          </div>

          <div className="pub-title-wrap">
            <h1 className="pub-product-title">{product.name}</h1>
            <div className="pub-tags">
              <span className="tag brand">{product.brand}</span>
              <span className="tag">{capitalize(product.category)}</span>
            </div>
          </div>

          <div className="pub-info-wrap">
            <div className="pub-info-grid">
              <div className="pub-info-item">
                <span className="pub-info-icon"><IconGlobe size={16} /></span>
                <div>
                  <div className="pub-meta-lbl">{t('public.country')}</div>
                  <div className="pub-meta-val">
                    {(() => {
                      const code = resolveCountryCode(product.country, lang);
                      return code
                        ? <CountryLabel code={code} />
                        : product.country;
                    })()}
                  </div>
                </div>
              </div>
              <div>
                <div className="pub-meta-lbl">{t('public.date')}</div>
                <div className="pub-meta-val">{formatDate(product.productionDate)}</div>
              </div>
            </div>
          </div>

          <div className="pub-mat-wrap">
            <SectionHeading>{t('public.materials')}</SectionHeading>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{t('editor.material.name')}</th>
                    <th className="col-w-120">{t('editor.material.percentage')}</th>
                    <th className="col-w-100">{t('editor.material.recycled')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(product.materials ?? []).map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.percentage}%</td>
                      <td>
                        {m.recycled ? (
                          <IconRecycle className="text-success" />
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {care && (
            <div className="pub-care-wrap">
              <SectionHeading>{t('public.care')}</SectionHeading>
              <div className="pub-care-grid">
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
                  <div className="pub-care-notes">{care.notes}</div>
                )}
              </div>
            </div>
          )}

          <div className="pub-footer">
            <p className="pub-footer-text">{t('public.poweredBy')}</p>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
