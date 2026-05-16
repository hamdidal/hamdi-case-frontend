import client from './client';
import type { Product, PaginatedResponse, ProductVersion, ProductFilters } from '@/types';

export function getProducts(filters?: ProductFilters) {
  return client.get<PaginatedResponse<Product>>('/products', { params: filters });
}

export function createProduct(data: Partial<Product>) {
  return client.post<Product>('/products', data);
}

export function getProduct(id: number | string) {
  return client.get<Product>(`/products/${id}`);
}

export function updateProduct(id: number | string, data: Partial<Product>) {
  return client.put<Product>(`/products/${id}`, data);
}

export function deleteProduct(id: number | string) {
  return client.delete<void>(`/products/${id}`);
}

export function getProductQRCodeUrl(id: number | string) {
  return `${import.meta.env.VITE_API_BASE_URL as string}/products/${id}/qrcode`;
}

export function downloadProductPDF(id: number | string) {
  return client.get<Blob>(`/products/${id}/pdf`, { responseType: 'blob' });
}

export function getProductVersions(id: number | string) {
  return client.get<ProductVersion[]>(`/products/${id}/versions`);
}

export function getProductVersion(id: number | string, versionNumber: number) {
  return client.get<ProductVersion>(`/products/${id}/versions/${versionNumber}`);
}

export function getPublicPassport(uuid: string) {
  return client.get<Product>(`/p/${uuid}`);
}
