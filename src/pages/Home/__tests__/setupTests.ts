import { beforeEach, vi, afterEach } from "vitest";
import {
  listByTypeNormalMock,
  listByTypeFireMock,
  pidgeotMock,
  pidgeottoMock,
  pidgeyMock,
  typesMock,
  charmanderMock,
  charizardMock,
  charmeleonMock,
} from "./mocks";

// Declare global as any to avoid TypeScript errors
declare const global: any;

beforeEach(() => {
  global.fetch = vi.fn((url: string) =>
    Promise.resolve({
      ok: true,
      json: async () => {
        if (url.includes("/type/normal")) {
          return listByTypeNormalMock;
        }
        if (url.includes("/type/fire")) {
          return listByTypeFireMock;
        }
        if (url.includes("/type/")) {
          return { results: typesMock };
        }
        if (url.includes("/pokemon/pidgey")) {
          return pidgeyMock;
        }
        if (url.includes("/pokemon/pidgeotto")) {
          return pidgeottoMock;
        }
        if (url.includes("/pokemon/pidgeot")) {
          return pidgeotMock;
        }
        if (url.includes("/pokemon/charmander")) {
          return charmanderMock;
        }
        if (url.includes("/pokemon/charmeleon")) {
          return charmeleonMock;
        }
        if (url.includes("/pokemon/charizard")) {
          return charizardMock;
        }

        return {};
      },
    })
  ) as any;
});

afterEach(() => {
  vi.resetAllMocks();
});
