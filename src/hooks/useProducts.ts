import { useState, useCallback } from 'react';
import { getProducts } from '@/api/products';
import type { Product, PaginatedResponse, ProductFilters } from '@/types';

interface UseProductsResult {
  data: PaginatedResponse<Product> | null;
  loading: boolean;
  error: string | null;
  fetch: (filters?: ProductFilters) => Promise<void>;
}

export function useProducts(initialFilters?: ProductFilters): UseProductsResult {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (filters?: ProductFilters) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProducts(filters ?? initialFilters);
        setData(res.data);
      } catch {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    },
    [initialFilters],
  );

  return { data, loading, error, fetch };
}
