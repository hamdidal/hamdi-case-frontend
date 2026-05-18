import type { AxiosInstance } from 'axios';
import { useLoadingStore } from '@/store/useLoadingStore';

export function attachLoadingInterceptors(instance: AxiosInstance): void {
  const { increment, decrement } = useLoadingStore.getState();

  instance.interceptors.request.use(
    (config) => {
      increment();
      return config;
    },
    (error) => {
      decrement();
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => {
      decrement();
      return response;
    },
    (error) => {
      decrement();
      return Promise.reject(error);
    },
  );
}
