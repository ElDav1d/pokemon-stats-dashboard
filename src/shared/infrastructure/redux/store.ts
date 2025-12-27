import { configureStore, Tuple } from "@reduxjs/toolkit";
import listControlsReducer from "../../../features/pokemon-list/infrastructure/redux/slices/listControlsSlice";
import {
  createPersistenceMiddleware,
  loadStateFromLocalStorage,
} from "./middleware/localStorageMiddleware";

export type RootState = {
  listControls: ReturnType<typeof listControlsReducer>;
};

const persistenceConfig = {
  storageKey: "__pokemon-dashboard__",
  slicesToPersist: ["listControls"],
};

const persistenceMiddleware =
  createPersistenceMiddleware<RootState>(persistenceConfig);
const preloadedState = loadStateFromLocalStorage<RootState>(
  persistenceConfig.storageKey
);

export const store = configureStore({
  reducer: {
    listControls: listControlsReducer,
  },
  preloadedState: preloadedState as RootState | undefined,
  middleware: () => new Tuple(persistenceMiddleware),
});

export type AppDispatch = typeof store.dispatch;
