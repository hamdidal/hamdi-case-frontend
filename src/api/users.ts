import client from './client';
import type { User, Role, PaginatedResponse } from '@/types';

export function getUsers(params?: { page?: number; limit?: number }) {
  return client.get<PaginatedResponse<User>>('users', { params });
}

export function updateUserRole(id: number | string, role: Role) {
  return client.patch<User>(`users/${id}/role`, { role });
}

export function deleteUser(id: number | string) {
  return client.delete<void>(`users/${id}`);
}

export function updateUserProfile(data: { username?: string; email?: string }) {
  return client.put<User>('users/me', data);
}

export function changeUserPassword(data: { current_password: string; new_password: string }) {
  return client.put<void>('users/me/password', data);
}
