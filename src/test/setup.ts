import '@testing-library/jest-dom';

// Zustand's persist middleware writes to localStorage synchronously in jsdom.
// Reset both storages before every test to prevent state leakage.
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// Suppress noisy console output produced by Ant Design in jsdom.
const noop = () => {};
vi.spyOn(console, 'error').mockImplementation(noop);
vi.spyOn(console, 'warn').mockImplementation(noop);
