import { vi, it, expect, beforeEach, afterEach } from 'vitest';
import { clearPersistedState } from '../localStorageMiddleware';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

it('should call localStorage.removeItem with correct key', () => {
  const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});

  clearPersistedState();

  expect(removeItemSpy).toHaveBeenCalledWith('__pokemon-dashboard__');

  removeItemSpy.mockRestore();
});

it('should not throw error when localStorage.removeItem succeeds', () => {
  const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});

  expect(() => {
    clearPersistedState();
  }).not.toThrow();

  removeItemSpy.mockRestore();
});

it('should call localStorage.removeItem even when called on empty storage', () => {
  const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});

  clearPersistedState();

  expect(removeItemSpy).toHaveBeenCalledWith('__pokemon-dashboard__');

  removeItemSpy.mockRestore();
});

it('should log message when state is cleared', () => {
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});

  clearPersistedState();

  expect(consoleSpy).toHaveBeenCalled();

  removeItemSpy.mockRestore();
  consoleSpy.mockRestore();
});

it('should handle error gracefully when localStorage.removeItem throws', () => {
  const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
    throw new Error('Storage access error');
  });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  expect(() => {
    clearPersistedState();
  }).not.toThrow();

  expect(consoleSpy).toHaveBeenCalled();
  expect(removeItemSpy).toHaveBeenCalledWith('__pokemon-dashboard__');

  removeItemSpy.mockRestore();
  consoleSpy.mockRestore();
});
