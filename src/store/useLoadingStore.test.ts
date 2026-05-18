import { describe, it, expect, beforeEach } from 'vitest';
import { useLoadingStore } from './useLoadingStore';

beforeEach(() => {
  useLoadingStore.setState({ activeRequests: 0 });
});

describe('useLoadingStore — increment', () => {
  it('increases activeRequests from 0 to 1', () => {
    useLoadingStore.getState().increment();
    expect(useLoadingStore.getState().activeRequests).toBe(1);
  });

  it('accumulates multiple increments', () => {
    useLoadingStore.getState().increment();
    useLoadingStore.getState().increment();
    useLoadingStore.getState().increment();
    expect(useLoadingStore.getState().activeRequests).toBe(3);
  });
});

describe('useLoadingStore — decrement', () => {
  it('decreases activeRequests from 2 to 1', () => {
    useLoadingStore.setState({ activeRequests: 2 });
    useLoadingStore.getState().decrement();
    expect(useLoadingStore.getState().activeRequests).toBe(1);
  });

  it('never goes below 0 (defensive floor)', () => {
    // Counter is already at 0 — decrement must be a no-op.
    useLoadingStore.getState().decrement();
    expect(useLoadingStore.getState().activeRequests).toBe(0);
  });

  it('floors at 0 even after multiple excess decrements', () => {
    useLoadingStore.getState().decrement();
    useLoadingStore.getState().decrement();
    useLoadingStore.getState().decrement();
    expect(useLoadingStore.getState().activeRequests).toBe(0);
  });
});

describe('useLoadingStore — isLoading derived state', () => {
  it('is effectively loading when activeRequests > 0', () => {
    useLoadingStore.getState().increment();
    expect(useLoadingStore.getState().activeRequests > 0).toBe(true);
  });

  it('is not loading when activeRequests reaches 0 after decrement', () => {
    useLoadingStore.getState().increment();
    useLoadingStore.getState().decrement();
    expect(useLoadingStore.getState().activeRequests).toBe(0);
  });

  it('stays not-loading when increment and decrement balance out', () => {
    for (let i = 0; i < 5; i++) useLoadingStore.getState().increment();
    for (let i = 0; i < 5; i++) useLoadingStore.getState().decrement();
    expect(useLoadingStore.getState().activeRequests).toBe(0);
  });
});
