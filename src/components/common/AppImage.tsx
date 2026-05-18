import { useState } from 'react';
import appiconSrc from '@/assets/appicon.png';
import productSrc from '@/assets/product.png';
import userSrc from '@/assets/user.png';

// Local asset fallbacks keyed by semantic variant.
const FALLBACKS = {
  'app-icon': appiconSrc,
  'product':  productSrc,
  'user':     userSrc,
} as const;

export type ImageVariant = keyof typeof FALLBACKS;

// Omit src and onError — this component owns both.
interface AppImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  variant: ImageVariant;
  // When src is absent or undefined the fallback is shown immediately.
  src?: string;
}

/**
 * Renders an <img> with an automatic local-asset fallback.
 *
 * - Falls back to the variant's bundled asset when src is absent or fails.
 * - Uses a `failed` state flag so the onError handler is removed after the
 *   first failure, preventing infinite error loops even if the fallback itself
 *   somehow triggers an error.
 * - Defaults to loading="lazy" for product and user variants (below-the-fold
 *   candidates); app-icon always loads eagerly (brand logo, always in viewport).
 */
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
