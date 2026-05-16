import client from './client';
import type { User, Role } from '@/types';

export function getUsers() {
  return client.get<User[]>('/users');
}

export function updateUserRole(id: number, role: Role) {
  return client.put<User>(`/users/${id}`, { role });
}

export function deleteUser(id: number) {
  return client.delete<void>(`/users/${id}`);
}
