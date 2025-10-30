import { beforeEach, vi, afterEach } from "vitest";
import {
  bulbasaurDetailMock,
  bulbasaurSpeciesMock,
  bulbasaurEvolutionChainMock,
  grassTypeListMock,
  poisonTypeListMock,
  ivysaurDetailMock,
  ivysaurSpeciesMock,
} from "./mocks";

beforeEach(() => {
  // Store any existing mock to chain with it
  const existingFetch = globalThis.fetch;

  globalThis.fetch = vi.fn(async (url: string) => {
    // Detail page specific mocks
    if (url.includes("/pokemon/bulbasaur")) {
      return Promise.resolve({
        ok: true,
        json: async () => bulbasaurDetailMock,
      }) as any;
    }
    if (url.includes("/pokemon/ivysaur")) {
      return Promise.resolve({
        ok: true,
        json: async () => ivysaurDetailMock,
      }) as any;
    }
    if (url.includes("/pokemon-species/1")) {
      return Promise.resolve({
        ok: true,
        json: async () => bulbasaurSpeciesMock,
      }) as any;
    }
    if (url.includes("/pokemon-species/2")) {
      return Promise.resolve({
        ok: true,
        json: async () => ivysaurSpeciesMock,
      }) as any;
    }
    if (url.includes("/evolution-chain/1")) {
      return Promise.resolve({
        ok: true,
        json: async () => bulbasaurEvolutionChainMock,
      }) as any;
    }
    if (url.includes("/type/grass")) {
      return Promise.resolve({
        ok: true,
        json: async () => grassTypeListMock,
      }) as any;
    }
    if (url.includes("/type/poison")) {
      return Promise.resolve({
        ok: true,
        json: async () => poisonTypeListMock,
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
