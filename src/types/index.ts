export type Role = 'admin' | 'auditor';

export type ProductStatus = 'draft' | 'published';

export type AuditAction = 'create' | 'update' | 'delete' | 'login';

export interface User {
  id: number;
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

export interface AuditLog {
  id: number;
  timestamp: string;
  userId?: number;
  username: string;
  action: AuditAction;
  entityId?: string;
  entityName?: string;
  changes?: Record<string, [unknown, unknown]>;
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
