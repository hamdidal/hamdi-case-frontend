import type { User } from '@/types';

export function decodeJwt(token: string): Partial<User> {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub ?? payload.id ?? 0,
      username: payload.username ?? payload.sub ?? '',
      role: payload.role ?? 'auditor',
      createdAt: payload.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return { id: 0, username: '', role: 'auditor', createdAt: new Date().toISOString() };
  }
}
