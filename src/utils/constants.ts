export const PIE_COLORS = [
  '#2D6A4F', '#40916C', '#74C69D', '#B7E4C7', '#52B788', '#1B4332',
] as const;

export const PAGE_SIZE_OPTIONS = [10, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

export const PRODUCT_CATEGORIES = [
  't-shirt', 'pantolon', 'ceket', 'ic-giyim', 'diger',
] as const;
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export const WASH_OPTIONS = [
  '30°C', '40°C', '60°C', 'El Yıkama', 'Yıkanamaz',
] as const;

export const IRON_OPTIONS = [
  'Uygun', 'Düşük Isı', 'Uygun Değil',
] as const;
