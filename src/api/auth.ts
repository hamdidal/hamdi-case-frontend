import client from './client';
import type { AuthToken } from '@/types';

export function login(username: string, password: string) {
  return client.post<AuthToken>('auth/login', { username, password });
}

export function register(username: string, password: string) {
  return client.post<void>('auth/register', { username, password });
}
