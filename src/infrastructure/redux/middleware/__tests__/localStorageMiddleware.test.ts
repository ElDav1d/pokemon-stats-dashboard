import { vi, it, expect, beforeEach, afterEach } from 'vitest';
import { createPersistenceMiddleware } from '../localStorageMiddleware';

const STORAGE_KEY = 'test-storage-key';
const TEST_SLICE_NAME = 'testSlice';
const SLICES_TO_PERSIST = [TEST_SLICE_NAME];

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
      testSlice: { testProp: true },
    }),
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  const action = { type: `${TEST_SLICE_NAME}/someAction` };

  const middleware = createPersistenceMiddleware({
    storageKey: STORAGE_KEY,
    slicesToPersist: SLICES_TO_PERSIST,
  });

  middleware(mockStore as any)(mockNext)(action);

  expect(mockNext).toHaveBeenCalledWith(action);

  setItemSpy.mockRestore();
});

it('should call localStorage.setItem when action type matches configured slice', () => {
  const mockNext = vi.fn();
  const mockState = {
    testSlice: { testProp: true },
  };
  const mockStore = {
    getState: () => mockState,
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  const action = { type: `${TEST_SLICE_NAME}/someAction` };

  const middleware = createPersistenceMiddleware({
    storageKey: STORAGE_KEY,
    slicesToPersist: SLICES_TO_PERSIST,
  });

  middleware(mockStore as any)(mockNext)(action);

  expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(mockState));

  setItemSpy.mockRestore();
});

it('should not call localStorage.setItem when action type does not match configured slice', () => {
  const mockNext = vi.fn();
  const mockStore = {
    getState: () => ({
      testSlice: { testProp: false },
    }),
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  const action = { type: 'otherSlice/someAction' };

  const middleware = createPersistenceMiddleware({
    storageKey: STORAGE_KEY,
    slicesToPersist: SLICES_TO_PERSIST,
  });

  middleware(mockStore as any)(mockNext)(action);

  expect(setItemSpy).not.toHaveBeenCalled();

  setItemSpy.mockRestore();
});

it('should call localStorage.setItem with updated state after action is processed', () => {
  const mockNext = vi.fn();
  let currentState = { testSlice: { testProp: false } };
  const mockStore = {
    getState: () => currentState,
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  const action = { type: `${TEST_SLICE_NAME}/updateValue`, payload: true };

  const middleware = createPersistenceMiddleware({
    storageKey: STORAGE_KEY,
    slicesToPersist: SLICES_TO_PERSIST,
  });

  // Simulate state change after action is processed
  mockNext.mockImplementation(() => {
    currentState = { testSlice: { testProp: true } };
  });

  middleware(mockStore as any)(mockNext)(action);

  expect(setItemSpy).toHaveBeenCalledWith(
    STORAGE_KEY,
    JSON.stringify({ testSlice: { testProp: true } })
  );

  setItemSpy.mockRestore();
});

it('should handle localStorage.setItem errors gracefully without throwing', () => {
  const mockNext = vi.fn();
  const mockStore = {
    getState: () => ({
      testSlice: { testProp: true },
    }),
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage full');
  });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const action = { type: `${TEST_SLICE_NAME}/someAction` };

  const middleware = createPersistenceMiddleware({
    storageKey: STORAGE_KEY,
    slicesToPersist: SLICES_TO_PERSIST,
  });

  expect(() => {
    middleware(mockStore as any)(mockNext)(action);
  }).not.toThrow();

  expect(consoleSpy).toHaveBeenCalled();

  setItemSpy.mockRestore();
  consoleSpy.mockRestore();
});

it('should still call next(action) even if localStorage.setItem fails', () => {
  const mockNext = vi.fn();
  const mockStore = {
    getState: () => ({
      testSlice: { testProp: true },
    }),
  };
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage error');
  });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const action = { type: `${TEST_SLICE_NAME}/someAction` };

  const middleware = createPersistenceMiddleware({
    storageKey: STORAGE_KEY,
    slicesToPersist: SLICES_TO_PERSIST,
  });

  middleware(mockStore as any)(mockNext)(action);

  expect(mockNext).toHaveBeenCalledWith(action);

  setItemSpy.mockRestore();
  consoleSpy.mockRestore();
});
