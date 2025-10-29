import { beforeEach, vi, afterEach } from "vitest";
import {
  listByTypeNormalMock,
  listByTypeFireMock,
  pidgeotMock,
  pidgeottoMock,
  pidgeyMock,
  typesMock,
  charmanderSimpleMock,
  charmeleonSimpleMock,
  charizardSimpleMock,
} from "./mocks";

beforeEach(() => {
  // Store any existing mock to chain with it
  const existingFetch = globalThis.fetch;

  globalThis.fetch = vi.fn(async (url: string) => {
    // Home page specific pokemon details
    if (url.includes("/pokemon/pidgey")) {
      return Promise.resolve({
        ok: true,
        json: async () => pidgeyMock,
      }) as any;
    }
    if (url.includes("/pokemon/pidgeotto")) {
      return Promise.resolve({
        ok: true,
        json: async () => pidgeottoMock,
      }) as any;
    }
    if (url.includes("/pokemon/pidgeot")) {
      return Promise.resolve({
        ok: true,
        json: async () => pidgeotMock,
      }) as any;
    }
    if (url.includes("/pokemon/charmander")) {
      return Promise.resolve({
        ok: true,
        json: async () => charmanderSimpleMock,
      }) as any;
    }
    if (url.includes("/pokemon/charmeleon")) {
      return Promise.resolve({
        ok: true,
        json: async () => charmeleonSimpleMock,
      }) as any;
    }
    if (url.includes("/pokemon/charizard")) {
      return Promise.resolve({
        ok: true,
        json: async () => charizardSimpleMock,
      }) as any;
    }

    // Home page specific type lists
    if (url.includes("/type/normal")) {
      return Promise.resolve({
        ok: true,
        json: async () => listByTypeNormalMock,
      }) as any;
    }
    if (url.includes("/type/fire")) {
      return Promise.resolve({
        ok: true,
        json: async () => listByTypeFireMock,
      }) as any;
    }

    // Generic type list endpoint
    if (url.includes("/type/")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ results: typesMock }),
      }) as any;
    }

    // Fall back to existing mock if there is one
    if (existingFetch && typeof existingFetch === "function") {
      return existingFetch(url);
    }

    // If no match, return empty response
    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    }) as any;
  }) as any;
});

afterEach(() => {
  vi.resetAllMocks();
});
