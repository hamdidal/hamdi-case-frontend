import type { AxiosInstance } from 'axios';
import { useLoadingStore } from '@/store/useLoadingStore';

/**
 * Attaches request-count-based loading interceptors to the given Axios instance.
 * The counter increments on every outgoing request and ALWAYS decrements in both
 * the success and error response paths, keeping the spinner from getting stuck.
 */
export function attachLoadingInterceptors(instance: AxiosInstance): void {
  const { increment, decrement } = useLoadingStore.getState();

  instance.interceptors.request.use(
    (config) => {
      increment();
      return config;
    },
    (error) => {
      // Request setup failed before it was sent — still decrement.
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
      // Network errors, 4xx, 5xx — all must decrement.
      decrement();
      return Promise.reject(error);
    },
  );
}
