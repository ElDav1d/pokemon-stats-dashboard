import { vi, it, expect, beforeEach, afterEach } from 'vitest';
import { loadStateFromLocalStorage } from '../localStorageMiddleware';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

it('should return undefined when localStorage.getItem returns null', () => {
  const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);

  const loaded = loadStateFromLocalStorage();

  expect(loaded).toBeUndefined();
  expect(getItemSpy).toHaveBeenCalledWith('__pokemon-dashboard__');

  getItemSpy.mockRestore();
});

it('should return parsed state when localStorage.getItem returns valid JSON', () => {
  const mockStateString = JSON.stringify({
    listPreferences: { someValue: true },
  });
  const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
    () => mockStateString
  );

  const loaded = loadStateFromLocalStorage();

  expect(loaded).toEqual({
    listPreferences: { someValue: true },
  });
  expect(getItemSpy).toHaveBeenCalledWith('__pokemon-dashboard__');

  getItemSpy.mockRestore();
});

it('should return state with false value when localStorage contains it', () => {
  const mockStateString = JSON.stringify({
    listPreferences: { someValue: false },
  });
  const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
    () => mockStateString
  );

  const loaded = loadStateFromLocalStorage();

  expect(loaded).toEqual({
    listPreferences: { someValue: false },
  });

  getItemSpy.mockRestore();
});

it('should return undefined when localStorage.getItem returns invalid JSON', () => {
  const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
    () => 'not valid json {{}}'
  );
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  const loaded = loadStateFromLocalStorage();

  expect(loaded).toBeUndefined();
  expect(consoleSpy).toHaveBeenCalled();

  getItemSpy.mockRestore();
  consoleSpy.mockRestore();
});

it('should return undefined and log error when localStorage.getItem throws', () => {
  const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Storage access denied');
  });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  const loaded = loadStateFromLocalStorage();

  expect(loaded).toBeUndefined();
  expect(consoleSpy).toHaveBeenCalled();
  expect(getItemSpy).toHaveBeenCalledWith('__pokemon-dashboard__');

  getItemSpy.mockRestore();
  consoleSpy.mockRestore();
});
