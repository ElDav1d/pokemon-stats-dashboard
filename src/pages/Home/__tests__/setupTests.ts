import { beforeEach, vi, afterEach } from "vitest";
import {
  listByTypeMock,
  pidgeotMock,
  pidgeottoMock,
  pidgeyMock,
  typesMock,
} from "./mocks";

// Declare global as any to avoid TypeScript errors
declare const global: any;

beforeEach(() => {
  global.fetch = vi.fn((url: string) =>
    Promise.resolve({
      ok: true,
      json: async () => {
        if (url.includes("/type/normal")) {
          return listByTypeMock;
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
        return {};
      },
    })
  ) as any;
});

afterEach(() => {
  vi.resetAllMocks();
});
