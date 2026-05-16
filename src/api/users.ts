import client from './client';
import type { User, Role } from '@/types';

export function getUsers() {
  return client.get<User[]>('/users');
}

export function updateUserRole(id: number, role: Role) {
  return client.patch<User>(`/users/${id}/role`, { role });
}

export function deleteUser(id: number) {
  return client.delete<void>(`/users/${id}`);
}

export function updateUserProfile(id: number, data: { username?: string; email?: string }) {
  return client.put<User>(`/users/${id}`, data);
}

export function changeUserPassword(id: number, data: { current_password: string; new_password: string }) {
  return client.put<void>(`/users/${id}`, data);
}
