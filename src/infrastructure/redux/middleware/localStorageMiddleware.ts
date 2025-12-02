import { Middleware } from '@reduxjs/toolkit';

export interface PersistenceConfig {
  storageKey: string;
  slicesToPersist: string[];
}

// Feature-agnostic - feature layer provides config
export const createPersistenceMiddleware = <S = any>(
  config: PersistenceConfig
): Middleware<{}, S> => {
  return (store) => (next) => (action: unknown) => {
    const result = next(action);

    const shouldPersist = config.slicesToPersist.some((slice) =>
      (action as any).type?.startsWith(`${slice}/`)
    );

    if (shouldPersist) {
      try {
        const state = store.getState();
        const dataToSave = config.slicesToPersist.reduce(
          (acc, slice) => ({
            ...acc,
            [slice]: (state as any)[slice],
          }),
          {} as Partial<S>
        );
        localStorage.setItem(config.storageKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }

    return result;
  };
};

export const loadStateFromLocalStorage = <S = any>(
  storageKey: string
): Partial<S> | undefined => {
  try {
    const serializedState = localStorage.getItem(storageKey);
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState) as Partial<S>;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return undefined;
  }
};

export const clearPersistedState = (storageKey: string): void => {
  try {
    localStorage.removeItem(storageKey);
    console.log('Persisted state cleared');
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};
