import { vi, it, expect, beforeEach, afterEach } from 'vitest';
import { localStorageMiddleware } from '../localStorageMiddleware';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

it('should call next(action) to pass action to reducer', () => {
  const mockNext = vi.fn();
  const mockStore = {
    getState: () => ({
      listPreferences: { someValue: true },
    }),
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  const action = { type: 'listPreferences/someAction' };

  const middleware = localStorageMiddleware(mockStore as any)(mockNext);
  middleware(action);

  expect(mockNext).toHaveBeenCalledWith(action);

  setItemSpy.mockRestore();
});

it('should call localStorage.setItem when action type matches listPreferences/*', () => {
  const mockNext = vi.fn();
  const mockState = {
    listPreferences: { someValue: true },
  };
  const mockStore = {
    getState: () => mockState,
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  const action = { type: 'listPreferences/someAction' };

  const middleware = localStorageMiddleware(mockStore as any)(mockNext);
  middleware(action);

  expect(setItemSpy).toHaveBeenCalledWith(
    '__pokemon-dashboard__',
    JSON.stringify(mockState)
  );

  setItemSpy.mockRestore();
});

it('should not call localStorage.setItem when action type does not match listPreferences/*', () => {
  const mockNext = vi.fn();
  const mockStore = {
    getState: () => ({
      listPreferences: { someValue: false },
    }),
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  const action = { type: 'someOtherSlice/someAction' };

  const middleware = localStorageMiddleware(mockStore as any)(mockNext);
  middleware(action);

  expect(setItemSpy).not.toHaveBeenCalled();

  setItemSpy.mockRestore();
});

it('should call localStorage.setItem with updated state after action is processed', () => {
  const mockNext = vi.fn();
  let currentState = { listPreferences: { someValue: false } };
  const mockStore = {
    getState: () => currentState,
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  const action = { type: 'listPreferences/updateValue', payload: true };

  const middleware = localStorageMiddleware(mockStore as any)(mockNext);

  // Simulate state change after action is processed
  mockNext.mockImplementation(() => {
    currentState = { listPreferences: { someValue: true } };
  });

  middleware(action);

  expect(setItemSpy).toHaveBeenCalledWith(
    '__pokemon-dashboard__',
    JSON.stringify({ listPreferences: { someValue: true } })
  );

  setItemSpy.mockRestore();
});

it('should handle localStorage.setItem errors gracefully without throwing', () => {
  const mockNext = vi.fn();
  const mockStore = {
    getState: () => ({
      listPreferences: { someValue: true },
    }),
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage full');
  });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const action = { type: 'listPreferences/someAction' };

  const middleware = localStorageMiddleware(mockStore as any)(mockNext);

  expect(() => {
    middleware(action);
  }).not.toThrow();

  expect(consoleSpy).toHaveBeenCalled();

  setItemSpy.mockRestore();
  consoleSpy.mockRestore();
});

it('should still call next(action) even if localStorage.setItem fails', () => {
  const mockNext = vi.fn();
  const mockStore = {
    getState: () => ({
      listPreferences: { someValue: true },
    }),
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage error');
  });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const action = { type: 'listPreferences/someAction' };

  const middleware = localStorageMiddleware(mockStore as any)(mockNext);
  middleware(action);

  expect(mockNext).toHaveBeenCalledWith(action);

  setItemSpy.mockRestore();
  consoleSpy.mockRestore();
});
