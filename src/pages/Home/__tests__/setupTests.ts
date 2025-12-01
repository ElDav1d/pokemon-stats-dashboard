import { beforeEach, vi, afterEach } from "vitest";
import { store } from "../../../infrastructure/redux/store";
import { toggleSortByHeight } from "../../../features/pokemon-list/infrastructure/redux/slices/listControlsSlice";
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
  localStorage.clear();
  const state = store.getState();
  if (state.listControls.sortByHeight) {
    store.dispatch(toggleSortByHeight());
  }
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
          return charmanderSimpleMock;
        }
        if (url.includes("/pokemon/charmeleon")) {
          return charmeleonSimpleMock;
        }
        if (url.includes("/pokemon/charizard")) {
          return charizardSimpleMock;
        }

        return {};
      },
    })
  ) as any;
});

afterEach(() => {
  vi.resetAllMocks();
});
