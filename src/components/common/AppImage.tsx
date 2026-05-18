import { useState } from 'react';
import appiconSrc from '@/assets/appicon.png';
import productSrc from '@/assets/product.png';
import userSrc from '@/assets/user.png';

const FALLBACKS = {
  'app-icon': appiconSrc,
  'product':  productSrc,
  'user':     userSrc,
} as const;

export type ImageVariant = keyof typeof FALLBACKS;

interface AppImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  variant: ImageVariant;
  src?: string;
}

export function AppImage({ variant, src, alt = '', loading, ...rest }: AppImageProps) {
  const [failed, setFailed] = useState(false);

  const fallback    = FALLBACKS[variant];
  const resolvedSrc = !src || failed ? fallback : src;
  const resolvedLoading: React.ImgHTMLAttributes<HTMLImageElement>['loading'] =
    loading ?? (variant === 'app-icon' ? 'eager' : 'lazy');

  return (
    <img
      {...rest}
      src={resolvedSrc}
      alt={alt}
      loading={resolvedLoading}
      onError={failed ? undefined : () => setFailed(true)}
    />
  );
}
