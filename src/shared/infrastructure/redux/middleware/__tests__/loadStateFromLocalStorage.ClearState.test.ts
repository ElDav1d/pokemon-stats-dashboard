import { vi, it, expect, beforeEach, afterEach } from "vitest";
import { clearPersistedState } from "../localStorageMiddleware";

const STORAGE_KEY = "__pokemon-dashboard__";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

it("should call localStorage.removeItem with correct key", () => {
  const removeItemSpy = vi
    .spyOn(Storage.prototype, "removeItem")
    .mockImplementation(() => {});

  clearPersistedState(STORAGE_KEY);

  expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY);

  removeItemSpy.mockRestore();
});

it("should not throw error when localStorage.removeItem succeeds", () => {
  const removeItemSpy = vi
    .spyOn(Storage.prototype, "removeItem")
    .mockImplementation(() => {});

  expect(() => {
    clearPersistedState(STORAGE_KEY);
  }).not.toThrow();

  removeItemSpy.mockRestore();
});

it("should call localStorage.removeItem even when called on empty storage", () => {
  const removeItemSpy = vi
    .spyOn(Storage.prototype, "removeItem")
    .mockImplementation(() => {});

  clearPersistedState(STORAGE_KEY);

  expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY);

  removeItemSpy.mockRestore();
});

it("should handle error gracefully when localStorage.removeItem throws", () => {
  const removeItemSpy = vi
    .spyOn(Storage.prototype, "removeItem")
    .mockImplementation(() => {
      throw new Error("Storage access error");
    });
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  expect(() => {
    clearPersistedState(STORAGE_KEY);
  }).not.toThrow();

  expect(consoleSpy).toHaveBeenCalled();
  expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY);

  removeItemSpy.mockRestore();
  consoleSpy.mockRestore();
});
