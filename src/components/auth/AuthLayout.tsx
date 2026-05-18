import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export function AuthPoster() {
  const { t } = useTranslation();
  const title: string = t('auth.posterTitle', 'Şeffaf bir tekstil için dijital pasaport.');
  const words = title.split(' ');
  const lastWord = words.pop();
  const rest = words.join(' ');
  return (
    <div className="auth-poster">
      <div className="side-brand">
        <div className="side-brand-mark" />
        <div className="side-brand-text">
          Kobe
          <small>DPP MANAGEMENT</small>
        </div>
      </div>
      <div className="poster-mark">
        {rest} <em>{lastWord}</em>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-wrap">
      <AuthPoster />
      <div className="auth-form-wrap">
        <div className="auth-form">
          {children}
        </div>
      </div>
    </div>
  );
}
