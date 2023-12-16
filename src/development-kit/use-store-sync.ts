import { useMemo, useRef } from 'react';
import { create, type StoreApi, type UseBoundStore } from 'zustand';

const useStoreSync = <T>(
  useStore: UseBoundStore<StoreApi<T>>,
  state: T,
): UseBoundStore<StoreApi<T>> => {
  const unsynced = useRef(true);
  const useServerStore = useMemo(() => create<T>(() => state), [state]);

  if (unsynced.current) {
    useStore.setState(state);
    unsynced.current = false;
  }

  return typeof window !== `undefined` ? useStore : useServerStore;
};

export { useStoreSync };
