import type { User } from '@/types';

export function decodeJwt(token: string): Partial<User> {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.user_id ?? payload.sub ?? payload.id ?? '',
      username: payload.username ?? payload.sub ?? '',
      role: payload.role ?? 'auditor',
      createdAt: payload.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return { id: '', username: '', role: 'auditor', createdAt: new Date().toISOString() };
  }
}
