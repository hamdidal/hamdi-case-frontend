export type Role = 'admin' | 'auditor';

export type ProductStatus = 'draft' | 'published';

export type AuditAction = 'create' | 'update' | 'delete' | 'login';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: Role;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthToken {
  token: string;
  user: User;
}

export interface Material {
  name: string;
  percentage: number;
  recycled: boolean;
}

export interface CareInstruction {
  washTemperature?: string;
  ironing?: string;
  dryClean: boolean;
  bleaching: boolean;
  notes?: string;
}

export interface Product {
  id: number;
  uuid: string;
  name: string;
  brand: string;
  category: string;
  country: string;
  productionDate: string;
  materials: Material[];
  careInstructions: CareInstruction;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ProductVersion {
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  snapshot: Partial<Product>;
}

export interface FieldChange {
  field: string;
  before: unknown;
  after: unknown;
}

export interface AuditChangesSnapshot {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  diff?: FieldChange[];
}

export type AuditChanges = AuditChangesSnapshot | Record<string, unknown>;

export interface AuditLog {
  id: number;
  timestamp: string;
  userId?: number;
  username: string;
  action: AuditAction;
  entityId?: string;
  entityName?: string;
  changes?: AuditChanges;
}

export interface DashboardStatItem {
  category: string;
  brand: string;
  createdAt: string;
  materials: Array<{ name: string; percentage: number }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface MetricResult {
  query: string;
  value: number;
  timestamp: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogFilters {
  entityId?: string;
  userId?: number;
  username?: string;
  action?: AuditAction;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

import type { Dayjs } from 'dayjs';

export interface CreateProductForm {
  name: string;
  brand: string;
  category: string;
  country: string;
  productionDate: Dayjs;
}

export interface ProductEditForm {
  name: string;
  brand: string;
  category: string;
  country: string;
  productionDate: Dayjs;
  washTemperature?: string;
  ironing?: string;
  dryClean: boolean;
  bleaching: boolean;
  notes?: string;
}
